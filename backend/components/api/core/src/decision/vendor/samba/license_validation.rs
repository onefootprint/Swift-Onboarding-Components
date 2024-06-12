use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use crate::decision::vendor::vendor_api::vendor_api_struct::SambaLicenseValidationCreate;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::decision::vendor::{
    map_to_api_error,
    AdditionalIdentityDocumentVerificationHelper,
};
use crate::enclave_client::EnclaveClient;
use crate::errors::{
    ApiResult,
    AssertionError,
};
use crate::utils::vault_wrapper::{
    Any,
    DecryptUncheckedResult,
    VaultWrapper,
    VwArgs,
};
use crate::State;
use db::models::decision_intent::DecisionIntent;
use db::models::document::Document;
use db::models::samba_order::{
    NewSambaOrderArgs,
    SambaOrder,
    UpdateSambaOrder,
};
use db::models::samba_report::SambaReport;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VReqIdentifier;
use db::PgConn;
use idv::samba::request::{
    SambaCreateLVOrderRequest,
    SambaGetLVReportRequest,
};
use idv::samba::response::license_validation::SambaLinkType;
use idv::samba::response::webhook::SambaWebhook;
use newtypes::samba::{
    SambaLicenseValidationData,
    SambaOrderKind,
};
use newtypes::{
    DataIdentifier,
    DataLifetimeId,
    DocumentDiKind,
    DocumentId,
    DocumentKind,
    IdDocKind,
    IdentityDataKind as IDK,
    OcrDataKind as ODK,
    SambaReportId,
    VendorAPI,
    WorkflowId,
};

#[allow(clippy::large_enum_variant)]
#[derive(Clone, Debug)]
pub enum CreateOrderContext {
    Workflow {
        wf_id: WorkflowId,
        di: DecisionIntent,
    },
    Adhoc {
        di: DecisionIntent,
        // support optionally sending data as well
        data: Option<SambaLicenseValidationData>,
    },
}

impl CreateOrderContext {
    pub fn vreq_identifier(&self) -> VReqIdentifier {
        match self {
            CreateOrderContext::Workflow { wf_id, .. } => VReqIdentifier::WfId(wf_id.clone()),
            CreateOrderContext::Adhoc { di, .. } => VReqIdentifier::DiId(di.id.clone()),
        }
    }

    pub fn decision_intent(&self) -> &DecisionIntent {
        match self {
            CreateOrderContext::Workflow { di, .. } => di,
            CreateOrderContext::Adhoc { di, .. } => di,
        }
    }

    pub fn is_adhoc_with_data(&self) -> bool {
        matches!(self, CreateOrderContext::Adhoc { data, .. } if data.is_some())
    }

    // TODO: more fields
    async fn get_decrypted_values(
        vw: &VaultWrapper,
        enclave_client: &EnclaveClient,
    ) -> ApiResult<(DecryptUncheckedResult, Vec<DataLifetimeId>)> {
        let fields = [
            DataIdentifier::from(IDK::FirstName),
            DataIdentifier::from(IDK::LastName),
            DataIdentifier::from(DocumentDiKind::OcrData(
                IdDocKind::DriversLicense,
                ODK::DocumentNumber,
            )),
            DataIdentifier::from(DocumentDiKind::OcrData(
                IdDocKind::DriversLicense,
                ODK::IssuingState,
            )),
        ];
        let decrypted = vw.decrypt_unchecked(enclave_client, &fields).await?;
        let lifetime_ids = fields
            .iter()
            .filter_map(|di| vw.get(di).map(|l| l.lifetime_id()))
            .cloned()
            .collect();

        Ok((decrypted, lifetime_ids))
    }

    fn get_document_id(&self, conn: &mut PgConn) -> ApiResult<Option<DocumentId>> {
        // If we're running this in the context of a wf, only check documents collected in this workflow
        let id_documents = match self {
            CreateOrderContext::Workflow { wf_id, .. } => {
                Document::list_completed_sent_to_incode(conn, wf_id)?
            }
            CreateOrderContext::Adhoc { di, .. } => {
                Document::list_completed_sent_to_incode(conn, &di.scoped_vault_id)?
            }
        };

        // need this filter since we only support sending OCR'd DL at the moment, in future can relax this
        let id_documents: Vec<_> = id_documents
            .into_iter()
            .filter(|(d, _, _)| d.vaulted_document_type == Some(DocumentKind::DriversLicense))
            .collect();

        let doc_id = AdditionalIdentityDocumentVerificationHelper::new(id_documents)
            .identity_document()
            .map(|d| d.id);

        Ok(doc_id)
    }

    async fn create_req_from_vault(
        vw: &VaultWrapper,
        enclave_client: &EnclaveClient,
        tvc: &TenantVendorControl,
    ) -> ApiResult<(SambaCreateLVOrderRequest, Vec<DataLifetimeId>)> {
        let (decrypted_values, lifetime_ids) = Self::get_decrypted_values(vw, enclave_client).await?;
        let request = SambaCreateLVOrderRequest {
            credentials: tvc.samba_credentials(),
            first_name: decrypted_values
                .get_di(DataIdentifier::from(IDK::FirstName))
                .ok()
                .ok_or(AssertionError("missing first name"))?,
            last_name: decrypted_values
                .get_di(DataIdentifier::from(IDK::LastName))
                .ok()
                .ok_or(AssertionError("missing last name"))?,
            license_number: decrypted_values
                .get_di(DataIdentifier::from(DocumentDiKind::OcrData(
                    IdDocKind::DriversLicense,
                    ODK::DocumentNumber,
                )))
                .ok()
                .ok_or(AssertionError("missing license number"))?,
            license_state: decrypted_values
                .get_di(DataIdentifier::from(DocumentDiKind::OcrData(
                    IdDocKind::DriversLicense,
                    ODK::IssuingState,
                )))
                .ok()
                .ok_or(AssertionError("missing license state"))?,
            ..Default::default()
        };

        Ok((request, lifetime_ids))
    }

    pub async fn create_request(
        &self,
        vw: &VaultWrapper,
        enclave_client: &EnclaveClient,
        tvc: &TenantVendorControl,
    ) -> ApiResult<(SambaCreateLVOrderRequest, Vec<DataLifetimeId>)> {
        match self {
            // we're in the context of a workflow
            CreateOrderContext::Workflow { .. } => Self::create_req_from_vault(vw, enclave_client, tvc).await,
            CreateOrderContext::Adhoc { data, .. } => {
                if let Some(d) = data {
                    Ok((
                        SambaCreateLVOrderRequest::from((d.clone(), tvc.samba_credentials())),
                        vec![],
                    ))
                } else {
                    Self::create_req_from_vault(vw, enclave_client, tvc).await
                }
            }
        }
    }
}

#[tracing::instrument(skip_all)]
pub async fn run_samba_create_order(state: &State, context: CreateOrderContext) -> ApiResult<()> {
    let di = context.decision_intent();
    let vreq_identifier = context.vreq_identifier();
    let svid = di.scoped_vault_id.clone();
    let di_id = di.id.clone();
    let context2 = context.clone();

    let (vw, tenant_id, doc_id) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;
            let tenant_id = sv.tenant_id.clone();
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;

            // If we're running this in the context of a wf, only check documents collected in this workflow
            let doc_id = context2.get_document_id(conn.conn())?;

            Ok((vw, tenant_id, doc_id))
        })
        .await?;

    if doc_id.is_none() && !context.is_adhoc_with_data() {
        return Err(AssertionError("no data to call samba").into());
    }

    // check if we've already created an order
    let existing_result = load_response_for_vendor_api(
        state,
        vreq_identifier,
        &vw.vault.e_private_key,
        SambaLicenseValidationCreate,
    )
    .await?
    .ok();
    if existing_result.is_some() {
        return Ok(());
    }

    // Make the call

    let tvc = TenantVendorControl::new(
        tenant_id.clone(),
        &state.db_pool,
        &state.config,
        &state.enclave_client,
    )
    .await?;
    // create our request based on what type of data we're handling
    let (request, lifetime_ids) = context.create_request(&vw, &state.enclave_client, &tvc).await?;

    // make request
    let res = state
        .vendor_clients
        .samba
        .samba_create_license_validation_order
        .make_request(request)
        .await;

    // save
    let args = SaveVerificationResultArgs::new_for_samba(
        &res,
        di.id.clone(),
        di.scoped_vault_id.clone(),
        vw.vault.public_key.clone(),
        VendorAPI::SambaLicenseValidationCreate,
        doc_id.clone(),
    );

    let (vres_id, _) = args.save(&state.db_pool).await?;

    let resp = res.map_err(map_to_api_error)?;
    // check we got a successful_response
    let create_order_response = resp.result.into_success().map_err(map_to_api_error)?;


    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let args = NewSambaOrderArgs {
                decision_intent_id: di_id,
                document_id: doc_id,
                lifetime_ids,
                kind: SambaOrderKind::LicenseValidation,
                order_id: create_order_response.order_id.leak_to_string().into(),
                verification_result_id: vres_id,
            };
            // create samba order
            let _ = SambaOrder::create(conn, args)?;

            Ok(())
        })
        .await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
pub async fn get_samba_license_validation_report(state: &State, webhook: SambaWebhook) -> ApiResult<()> {
    let Some(report_id) = webhook
        .get_link(SambaLinkType::LicenseReports)
        .map(|l| SambaReportId::from(l.report_id))
    else {
        return Err(AssertionError("missing report id").into());
    };

    let order_id = webhook.data.order_id.clone();
    let (order, di, tenant_id, vw) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // TODO: handle error from not finding Order?
            let order = SambaOrder::get(conn, &order_id)?;
            let di = DecisionIntent::get(conn, &order.decision_intent_id)?;
            let sv = ScopedVault::get(conn, &di.scoped_vault_id)?;
            let tenant_id = sv.tenant_id.clone();
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;

            Ok((order, di, tenant_id, vw))
        })
        .await?;

    if order.completed_at.is_some() {
        tracing::info!(order_id=%order.id, "samba order already completed");
        return Ok(());
    }

    let tvc =
        TenantVendorControl::new(tenant_id, &state.db_pool, &state.config, &state.enclave_client).await?;
    let request = SambaGetLVReportRequest {
        credentials: tvc.samba_credentials(),
        report_id: report_id.clone(),
    };

    // make request
    let res = state
        .vendor_clients
        .samba
        .samba_get_license_validation_report
        .make_request(request)
        .await;

    // save
    let args = SaveVerificationResultArgs::new_for_samba(
        &res,
        di.id.clone(),
        di.scoped_vault_id.clone(),
        vw.vault.public_key.clone(),
        VendorAPI::SambaLicenseValidationGetReport,
        order.document_id.clone(),
    );

    let (vres_id, _) = args.save(&state.db_pool).await?;

    let resp = res.map_err(map_to_api_error)?;
    // check we got a successful_response
    // TODO: How should we handle this? i think this is right, we don't complete the order if we get
    // some sort of error..
    let _ = resp.result.into_success().map_err(map_to_api_error)?;


    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let locked = SambaOrder::lock(conn, &order.id)?;
            // check again we should be creating the report
            if locked.completed_at.is_none() {
                let _ = SambaReport::create(conn, order.id, report_id, vres_id)?;
                let update = UpdateSambaOrder::set_completed_at();
                let _ = SambaOrder::update(conn, locked, update)?;
            }

            Ok(())
        })
        .await?;

    Ok(())
}

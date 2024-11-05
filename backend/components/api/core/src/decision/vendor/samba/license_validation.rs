use crate::decision::features::incode_utils::ParsedIncodeAddress;
use crate::decision::features::incode_utils::ParsedIncodeNames;
use crate::decision::vendor::into_fp_error;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::decision::vendor::AdditionalIdentityDocumentVerificationHelper;
use crate::errors::AssertionError;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use crate::State;
use db::models::decision_intent::DecisionIntent;
use db::models::document::Document;
use db::models::samba_order::NewSambaOrderArgs;
use db::models::samba_order::SambaOrder;
use db::models::samba_order::UpdateSambaOrder;
use db::models::samba_report::SambaReport;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VReqIdentifier;
use db::PgConn;
use idv::incode::doc::response::FetchOCRResponse;
use idv::samba::client::SambaResult;
use idv::samba::common::SambaGetReportRequest;
use idv::samba::common::SambaOrderRequest;
use idv::samba::license_state_is_supported_for_license_validation;
use idv::samba::response::webhook::SambaWebhook;
use idv::samba::response::CreateOrderResponse;
use idv::samba::response::SambaLinkType;
use idv::samba::SambaAPIResponse;
use newtypes::samba::SambaAddress;
use newtypes::samba::SambaData;
use newtypes::samba::SambaOrderKind;
use newtypes::vendor_api_struct::IncodeFetchOcr;
use newtypes::vendor_api_struct::SambaLicenseValidationCreate;
use newtypes::vendor_credentials::SambaSafetyCredentials;
use newtypes::DataLifetimeId;
use newtypes::DocumentId;
use newtypes::DocumentKind;
use newtypes::PiiString;
use newtypes::SambaActivityHistoryCreate;
use newtypes::SambaReportId;
use newtypes::UsStateAndTerritories;
use newtypes::VendorAPI;
use newtypes::WorkflowId;


#[derive(Clone, Debug)]
pub struct CreateOrderArgs {
    pub kind: SambaOrderKind,
    pub ctx: CreateOrderContext,
}

#[allow(clippy::large_enum_variant)]
#[derive(Clone, Debug)]
pub enum CreateOrderContext {
    // TODO: support IDK version of this. For now we pull from the iddoc
    Workflow {
        wf_id: WorkflowId,
        di: DecisionIntent,
    },
    // TODO: support IDK version of this. For now we pull from the latest DL iddoc
    Adhoc {
        di: DecisionIntent,
        // support optionally sending data as well
        data: Option<SambaData>,
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

    #[tracing::instrument(skip_all)]
    fn get_document_id(&self, conn: &mut PgConn) -> FpResult<Option<DocumentId>> {
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
}

#[derive(Clone, Debug)]
pub struct SambaOrderHelper {
    pub kind: SambaOrderKind,
    pub ctx: CreateOrderContext,
}

impl SambaOrderHelper {
    #[tracing::instrument(skip_all)]
    pub async fn create_lv_request(
        &self,
        state: &State,
        vw: &VaultWrapper,
        doc_id: Option<DocumentId>,
        tvc: &TenantVendorControl,
    ) -> FpResult<(
        SambaOrderRequest<SambaLicenseValidationCreate>,
        Vec<DataLifetimeId>,
    )> {
        let (request, lifetime_ids) = match &self.ctx {
            // we're in the context of a workflow
            CreateOrderContext::Workflow { .. } => {
                build_request_from_ocr_response(state, vw, doc_id, tvc).await?
            }
            CreateOrderContext::Adhoc { data, .. } => {
                if let Some(d) = data {
                    let request = SambaOrderRequest::new(tvc.samba_credentials(), d.clone());
                    (request, vec![])
                } else {
                    // otherwise take the latest DL and run it through
                    build_request_from_ocr_response(state, vw, doc_id, tvc).await?
                }
            }
        };
        // Validate
        let state = UsStateAndTerritories::from_raw_string(request.data.license_state.leak()).ok();
        self.validate_state(state)?;

        Ok((request, lifetime_ids))
    }

    #[tracing::instrument(skip_all)]
    pub async fn create_ah_request(
        &self,
        _state: &State,
        _vw: &VaultWrapper,
        _doc_id: Option<DocumentId>,
        _tvc: &TenantVendorControl,
    ) -> FpResult<(SambaOrderRequest<SambaActivityHistoryCreate>, Vec<DataLifetimeId>)> {
        todo!()
    }

    fn validate_state(&self, state: Option<UsStateAndTerritories>) -> FpResult<()> {
        let state = state.ok_or(AssertionError("missing license state"))?; // maybe should be 400?
        match self.kind {
            SambaOrderKind::LicenseValidation => {
                if license_state_is_supported_for_license_validation(state) {
                    Ok(())
                } else {
                    let err = idv::samba::error::Error::UnsupportedState("license_validation".to_string());
                    Err(into_fp_error(err))
                }
            }
            SambaOrderKind::ActivityHistory => Ok(()),
        }
    }

    // Remove the generic type parameter and make two separate methods
    #[tracing::instrument(skip_all)]
    pub async fn make_license_validation_request(
        &self,
        state: &State,
        request: SambaOrderRequest<SambaLicenseValidationCreate>,
    ) -> SambaResult<SambaAPIResponse<CreateOrderResponse>> {
        state
            .vendor_clients
            .samba
            .samba_create_license_validation_order
            .make_request(request)
            .await
    }

    #[tracing::instrument(skip_all)]
    pub async fn make_activity_history_request(
        &self,
        state: &State,
        request: SambaOrderRequest<SambaActivityHistoryCreate>,
    ) -> SambaResult<SambaAPIResponse<CreateOrderResponse>> {
        state
            .vendor_clients
            .samba
            .samba_create_activity_history_order
            .make_request(request)
            .await
    }
}

#[tracing::instrument(skip_all)]
async fn build_request_from_ocr_response(
    state: &State,
    vw: &VaultWrapper,
    doc_id: Option<DocumentId>,
    tvc: &TenantVendorControl,
) -> FpResult<(
    SambaOrderRequest<SambaLicenseValidationCreate>,
    Vec<DataLifetimeId>,
)> {
    let Some(did) = doc_id else {
        return Err(AssertionError("missing document id").into());
    };

    let Some((ocr_res, _)) = load_response_for_vendor_api(
        state,
        VReqIdentifier::DocumentId(did),
        &vw.vault.e_private_key,
        IncodeFetchOcr,
    )
    .await?
    .ok() else {
        return Err(AssertionError("missing fetch ocr res").into());
    };

    let request = build_request(&ocr_res, tvc.samba_credentials())?;
    Ok((request, vec![]))
}

fn build_request(
    ocr_res: &FetchOCRResponse,
    credentials: SambaSafetyCredentials,
) -> FpResult<SambaOrderRequest<SambaLicenseValidationCreate>> {
    let names = ParsedIncodeNames::from_fetch_ocr_res(ocr_res);
    let address: ParsedIncodeAddress = ParsedIncodeAddress::from_fetch_ocr_res(ocr_res);
    let samba_address = match (address.street, address.zip, address.city, address.state) {
        (Some(street), Some(zip_code), Some(city), Some(state)) => Some(SambaAddress {
            street,
            zip_code,
            city,
            state,
        }),
        _ => None,
    };
    let dob: Option<PiiString> = ocr_res.dob().ok().map(|s| s.into());
    let data = SambaData {
        first_name: names.first_name.ok_or(AssertionError("missing first name"))?,
        last_name: names.last_name.ok_or(AssertionError("missing last name"))?,
        license_number: ocr_res
            .document_number
            .clone()
            .map(|s| s.into())
            .ok_or(AssertionError("missing license number"))?,
        license_state: ocr_res
            .issuing_state_us_2_char()
            .map(|s| s.to_string().into())
            .ok_or(AssertionError("missing license state"))?,

        dob,
        address: samba_address,
        ..Default::default()
    };

    let request = SambaOrderRequest::new(credentials, data);

    Ok(request)
}

#[tracing::instrument(skip_all)]
pub async fn run_samba_create_order(
    state: &State,
    context: CreateOrderContext,
    kind: SambaOrderKind,
) -> FpResult<()> {
    let di = context.decision_intent();
    let vreq_identifier = context.vreq_identifier();
    let svid = di.scoped_vault_id.clone();
    let di_id = di.id.clone();
    let context2 = context.clone();

    let (vw, tenant_id, doc_id) = state
        .db_transaction(move |conn| -> FpResult<_> {
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

    let samba_helper = SambaOrderHelper {
        kind,
        ctx: context.clone(),
    };

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
    let (res, lifetime_ids, vendor_api) = match samba_helper.kind {
        SambaOrderKind::LicenseValidation => {
            let (request, lifetime_ids) = samba_helper
                .create_lv_request(state, &vw, doc_id.clone(), &tvc)
                .await?;
            (
                samba_helper.make_license_validation_request(state, request).await,
                lifetime_ids,
                VendorAPI::SambaLicenseValidationCreate,
            )
        }
        SambaOrderKind::ActivityHistory => {
            let (request, lifetime_ids) = samba_helper
                .create_ah_request(state, &vw, doc_id.clone(), &tvc)
                .await?;
            (
                samba_helper.make_activity_history_request(state, request).await,
                lifetime_ids,
                VendorAPI::SambaActivityHistoryCreate,
            )
        }
    };

    // save
    let args = SaveVerificationResultArgs::new_for_samba(
        &res,
        di.id.clone(),
        di.scoped_vault_id.clone(),
        vw.vault.public_key.clone(),
        vendor_api,
        doc_id.clone(),
    );

    let (vres_id, _) = args.save(&state.db_pool).await?;

    let resp = res.map_err(into_fp_error)?;
    // check we got a successful_response
    let create_order_response = resp.result.into_success().map_err(into_fp_error)?;

    state
        .db_transaction(move |conn| -> FpResult<_> {
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
pub async fn get_samba_license_validation_report(state: &State, webhook: SambaWebhook) -> FpResult<()> {
    let Some(report_id) = webhook
        .get_link(SambaLinkType::LicenseReports)
        .map(|l| SambaReportId::from(l.report_id))
    else {
        return Err(AssertionError("missing report id").into());
    };

    let order_id = webhook.data.order_id.clone();
    let (order, di, tenant_id, vw) = state
        .db_query(move |conn| -> FpResult<_> {
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
    let request = SambaGetReportRequest::new(tvc.samba_credentials(), report_id.clone());

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

    let resp = res.map_err(into_fp_error)?;
    // check we got a successful_response
    // TODO: How should we handle this? i think this is right, we don't complete the order if we get
    // some sort of error..
    let _ = resp.result.into_success().map_err(into_fp_error)?;

    state
        .db_transaction(move |conn| -> FpResult<_> {
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


#[cfg(test)]
mod tests {
    use super::*;
    use idv::incode::doc::response::IncodeOcrFixtureResponseFields;
    use test_case::test_case;


    #[test_case("NY" => "NY".to_string())]
    #[test_case(" NeW yorK" => "NY".to_string())]
    fn test_build_request(state: &str) -> String {
        let creds = SambaSafetyCredentials {
            api_key: "a".to_string().into(),
            base_url: "a".to_string().into(),
            auth_username: "a".to_string().into(),
            auth_password: "a".to_string().into(),
        };
        let fixture = IncodeOcrFixtureResponseFields {
            issuing_state: Some(PiiString::from(state)),
            ..Default::default()
        };

        let ocr_res: FetchOCRResponse =
            serde_json::from_value(FetchOCRResponse::fixture_response(Some(fixture))).unwrap();
        let req = build_request(&ocr_res, creds).unwrap();
        req.data.license_state.leak().to_string()
    }
}

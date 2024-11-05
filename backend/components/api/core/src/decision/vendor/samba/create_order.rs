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
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VReqIdentifier;
use db::PgConn;
use idv::incode::doc::response::FetchOCRResponse;
use idv::samba::client::SambaResult;
use idv::samba::common::SambaOrderRequest;
use idv::samba::license_state_is_supported_for_license_validation;
use idv::samba::response::CreateOrderResponse;
use idv::samba::SambaAPIResponse;
use newtypes::samba::SambaAddress;
use newtypes::samba::SambaData;
use newtypes::samba::SambaOrderKind;
use newtypes::vendor_api_struct::IncodeFetchOcr;
use newtypes::vendor_api_struct::SambaLicenseValidationCreate;
use newtypes::DataLifetimeId;
use newtypes::DocumentId;
use newtypes::DocumentKind;
use newtypes::PiiString;
use newtypes::SambaActivityHistoryCreate;
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
    fn get_document(&self, conn: &mut PgConn) -> FpResult<Option<Document>> {
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

        let doc = AdditionalIdentityDocumentVerificationHelper::new(id_documents).identity_document();

        Ok(doc)
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
                let (data, lifetime_ids) = build_request_from_ocr_response(state, vw, doc_id).await?;
                let request = SambaOrderRequest::new(tvc.samba_credentials(), data);
                (request, lifetime_ids)
            }
            CreateOrderContext::Adhoc { data, .. } => {
                if let Some(d) = data {
                    let request = SambaOrderRequest::new(tvc.samba_credentials(), d.clone());
                    (request, vec![])
                } else {
                    // otherwise take the latest DL and run it through
                    let (data, lifetime_ids) = build_request_from_ocr_response(state, vw, doc_id).await?;
                    let request = SambaOrderRequest::new(tvc.samba_credentials(), data);
                    (request, lifetime_ids)
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
        state: &State,
        vw: &VaultWrapper,
        doc_id: Option<DocumentId>,
        tvc: &TenantVendorControl,
    ) -> FpResult<(SambaOrderRequest<SambaActivityHistoryCreate>, Vec<DataLifetimeId>)> {
        let (request, lifetime_ids) = match &self.ctx {
            // we're in the context of a workflow
            // TODO: change this to DIs
            CreateOrderContext::Workflow { .. } => {
                let (data, lifetime_ids) = build_request_from_ocr_response(state, vw, doc_id).await?;
                let request = SambaOrderRequest::new(tvc.samba_credentials(), data);
                (request, lifetime_ids)
            }
            CreateOrderContext::Adhoc { data, .. } => {
                if let Some(d) = data {
                    let request = SambaOrderRequest::new(tvc.samba_credentials(), d.clone());
                    (request, vec![])
                } else {
                    // otherwise take the latest DL and run it through
                    let (data, lifetime_ids) = build_request_from_ocr_response(state, vw, doc_id).await?;
                    let request = SambaOrderRequest::new(tvc.samba_credentials(), data);
                    (request, lifetime_ids)
                }
            }
        };
        // Validate
        let state = UsStateAndTerritories::from_raw_string(request.data.license_state.leak()).ok();
        self.validate_state(state)?;

        Ok((request, lifetime_ids))
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
            // Samba apparently supports all for activity_history (but not all have both court and public
            // records) See https://docs.google.com/spreadsheets/d/1JF6Db1hVbVKWL9NWPPrSdRLJGjGM8uGQ/edit?gid=644192107#gid=644192107
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
) -> FpResult<(SambaData, Vec<DataLifetimeId>)> {
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

    let data = build_request(&ocr_res)?;
    Ok((data, vec![]))
}

fn build_request(ocr_res: &FetchOCRResponse) -> FpResult<SambaData> {
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

    Ok(data)
}

#[derive(Clone, Debug)]
pub struct SambaOrderConfig {
    pub states: Vec<UsStateAndTerritories>,
}

#[tracing::instrument(skip_all)]
pub async fn run_samba_create_order(
    state: &State,
    context: CreateOrderContext,
    kind: SambaOrderKind,
    config: Option<SambaOrderConfig>,
) -> FpResult<()> {
    let di = context.decision_intent();
    let vreq_identifier = context.vreq_identifier();
    let svid = di.scoped_vault_id.clone();
    let di_id = di.id.clone();
    let context2 = context.clone();

    let (vw, tenant_id, doc) = state
        .db_transaction(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;
            let tenant_id = sv.tenant_id.clone();
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;

            // If we're running this in the context of a wf, only check documents collected in this workflow
            let doc = context2.get_document(conn.conn())?;

            Ok((vw, tenant_id, doc))
        })
        .await?;

    if doc.is_none() && !context.is_adhoc_with_data() {
        return Err(AssertionError("no data to call samba").into());
    }

    let doc_id = doc.as_ref().map(|d| d.id.clone());

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

            // TODO: will need to refactor this in the future. Not all too elegant
            if let Some(config) = config.as_ref() {
                let state = UsStateAndTerritories::from_raw_string(request.data.license_state.leak()).ok();
                if state.map(|s| !config.states.contains(&s)).unwrap_or(true) {
                    tracing::info!(?state, "Samba config does not support this state");
                    return Ok(());
                }
            }

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
                document_id: doc_id.clone(),
                lifetime_ids,
                kind: samba_helper.kind,
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


#[cfg(test)]
mod tests {
    use super::*;
    use idv::incode::doc::response::IncodeOcrFixtureResponseFields;
    use test_case::test_case;


    #[test_case("NY" => "NY".to_string())]
    #[test_case(" NeW yorK" => "NY".to_string())]
    fn test_build_request(state: &str) -> String {
        let fixture = IncodeOcrFixtureResponseFields {
            issuing_state: Some(PiiString::from(state)),
            ..Default::default()
        };

        let ocr_res: FetchOCRResponse =
            serde_json::from_value(FetchOCRResponse::fixture_response(Some(fixture))).unwrap();
        let data = build_request(&ocr_res).unwrap();
        data.license_state.leak().to_string()
    }
}

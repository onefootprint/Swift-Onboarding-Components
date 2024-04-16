use crate::{
    errors::ApiResult,
    utils::vault_wrapper::{Any, VaultWrapper, VwArgs},
    ApiError, State,
};
use db::models::{decision_intent::DecisionIntent, verification_request::VerificationRequest};
use idv::{
    neuro_id::{
        response::{NeuroApiResponse, NeuroIdAnalyticsResponse},
        NeuroIdAnalyticsRequest,
    },
    ParsedResponse, VendorResponse,
};
use newtypes::{
    vendor_credentials::{NeuroIdCredentials, NeuroIdSiteId},
    DecisionIntentId, NeuroIdentityId, ScopedVaultId, TenantId, VaultPublicKey, VendorAPI, WorkflowId,
};

use super::{
    map_to_api_error,
    tenant_vendor_control::TenantVendorControl,
    vendor_result::VendorResult,
    verification_result::{SaveVerificationResultArgs, ShouldSaveVerificationRequest},
};


impl SaveVerificationResultArgs {
    pub fn new_for_neuro(
        request_result: &Result<NeuroApiResponse, idv::neuro_id::error::Error>,
        decision_intent_id: DecisionIntentId,
        scoped_vault_id: ScopedVaultId,
        vault_public_key: VaultPublicKey,
    ) -> Self {
        let should_save_verification_request =
            ShouldSaveVerificationRequest::Yes(VendorAPI::NeuroIdAnalytics);
        match request_result {
            Ok(response) => {
                let is_error = response.result.is_error();
                let raw_response = response.raw_response.clone();

                let scrubbed_response = response
                    .result
                    .scrub()
                    .map_err(|e| ApiError::from(idv::Error::from(e)))
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    is_error,
                    raw_response,
                    scrubbed_response,
                    should_save_verification_request,
                    decision_intent_id,
                    vault_public_key,
                    scoped_vault_id,
                    identity_document_id: None,
                }
            }
            Err(_) => Self {
                is_error: true,
                raw_response: serde_json::json!("").into(),
                scrubbed_response: serde_json::json!("").into(),
                should_save_verification_request,
                decision_intent_id,
                vault_public_key,
                scoped_vault_id,
                identity_document_id: None,
            },
        }
    }
}


#[tracing::instrument(skip(state, di))]
pub async fn run_neuro_call(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
    t_id: &TenantId,
) -> ApiResult<Option<VendorResult>> {
    let di_id = di.id.clone();
    let svid = di.scoped_vault_id.clone();
    let (vw, latest_results) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&svid))?;
            let latest_results =
                VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, &di_id)?;

            Ok((vw, latest_results))
        })
        .await?;

    // If we already have a successful neuro validation for this DI, we return early
    let existing_vendor_result =
        VendorResult::get_successful_response(state, latest_results, &vw, VendorAPI::NeuroIdAnalytics)
            .await?;

    if existing_vendor_result.is_some() {
        return Ok(existing_vendor_result);
    }

    let tvc =
        TenantVendorControl::new(t_id.clone(), &state.db_pool, &state.config, &state.enclave_client).await?;
    // TODO: get this site_id from a playbook config somewhere
    // TODO: change this to sandbox form
    let credentials = NeuroIdCredentials::new(tvc.neuro_api_key(), NeuroIdSiteId("form_humor717".into()));
    let id = NeuroIdentityId::from(wf_id.clone());

    let res = state
        .vendor_clients
        .neuro_id
        .make_request(NeuroIdAnalyticsRequest { credentials, id })
        .await;

    let args = SaveVerificationResultArgs::new_for_neuro(
        &res,
        di.id.clone(),
        di.scoped_vault_id.clone(),
        vw.vault.public_key.clone(),
    );
    let (vres_id, vreq_id) = args.save(&state.db_pool).await?;
    let neuro_response = res.map_err(map_to_api_error)?;
    let raw_response = neuro_response.raw_response.clone();
    let parsed: NeuroIdAnalyticsResponse = neuro_response.result.into_success().map_err(map_to_api_error)?;

    let vendor_result = VendorResult {
        response: VendorResponse {
            response: ParsedResponse::NeuroIdAnalytics(parsed),
            raw_response,
        },
        verification_result_id: vres_id,
        verification_request_id: vreq_id,
    };

    Ok(Some(vendor_result))
}

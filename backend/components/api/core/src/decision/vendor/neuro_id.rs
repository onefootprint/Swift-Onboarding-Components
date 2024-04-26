use crate::{
    errors::ApiResult,
    utils::vault_wrapper::{Any, VaultWrapper, VwArgs},
    ApiError, State,
};
use db::models::{
    decision_intent::DecisionIntent,
    neuro_id_analytics_event::{NeuroIdAnalyticsEvent, NewNeuroIdAnalyticsEvent},
    scoped_vault::ScopedVault,
    verification_request::VerificationRequest,
};
use feature_flag::BoolFlag;
use idv::{
    neuro_id::{
        response::{NeuroApiResponse, NeuroIdAnalyticsResponse, NeuroIdAttributes},
        NeuroIdAnalyticsRequest,
    },
    ParsedResponse, VendorResponse,
};
use newtypes::{
    vendor_credentials::{NeuroIdCredentials, NeuroIdSiteId},
    DecisionIntentId, NeuroIdentityId, ScopedVaultId, TenantId, VaultPublicKey, VendorAPI,
    VerificationResultId, WorkflowId,
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
    let (vw, latest_results, scoped_vault) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&svid))?;
            let latest_results =
                VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, &di_id)?;
            let scoped_vault = ScopedVault::get(conn, &svid)?;

            Ok((vw, latest_results, scoped_vault))
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
    let use_test_key = !(state.config.service_config.is_production() && scoped_vault.is_live);
    let credentials = NeuroIdCredentials::new(
        tvc.neuro_api_key(),
        NeuroIdSiteId("form_humor717".into()),
        use_test_key,
    );
    let id = NeuroIdentityId::from(wf_id.clone());

    let res = state
        .vendor_clients
        .neuro_id
        .make_request(NeuroIdAnalyticsRequest {
            credentials,
            id: id.clone(),
        })
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

    // save event for metrics/dupes/user insights
    save_neuro_event(state, &parsed, t_id, id, &di.scoped_vault_id, wf_id, &vres_id).await?;

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

async fn save_neuro_event(
    state: &State,
    response: &NeuroIdAnalyticsResponse,
    tenant_id: &TenantId,
    neuro_identifier: NeuroIdentityId,
    scoped_vault_id: &ScopedVaultId,
    workflow_id: &WorkflowId,
    vres_id: &VerificationResultId,
) -> ApiResult<()> {
    let attributes = NeuroIdAttributes::new(response);

    let event = NewNeuroIdAnalyticsEvent {
        verification_result_id: vres_id.clone(),
        workflow_id: workflow_id.clone(),
        scoped_vault_id: scoped_vault_id.clone(),
        tenant_id: tenant_id.clone(),
        neuro_identifier: neuro_identifier.clone(),
        cookie_id: response.profile.client_id.clone(),
        device_id: response.profile.device_id.clone(),
        model_fraud_ring_indicator_result: attributes.model_fraud_ring_indicator_result,
        model_automated_activity_result: attributes.model_automated_activity_result,
        model_risky_device_result: attributes.model_risky_device_result,
        model_factory_reset_result: attributes.model_factory_reset_result,
        model_gps_spoofing_result: attributes.model_gps_spoofing_result,
        model_tor_exit_node_result: attributes.model_tor_exit_node_result,
        model_public_proxy_result: attributes.model_public_proxy_result,
        model_vpn_result: attributes.model_vpn_result,
        model_ip_blocklist_result: attributes.model_ip_blocklist_result,
        model_ip_address_association_result: attributes.model_ip_address_association_result,
        model_incognito_result: attributes.model_incognito_result,
        model_bot_framework_result: attributes.model_bot_framework_result,
        model_suspicious_device_result: attributes.model_suspicious_device_result,
        model_multiple_ids_per_device_result: attributes.model_multiple_ids_per_device_result,
        model_device_reputation_result: attributes.model_device_reputation_result,
        suspicious_device_emulator: attributes.emulator,
        suspicious_device_jailbroken: attributes.jailbroken,
        suspicious_device_missing_expected_properties: attributes.missing_expected_properties,
        suspicious_device_frida: attributes.frida,
    };

    state
        .db_pool
        .db_query(move |conn| NeuroIdAnalyticsEvent::create(conn, event))
        .await?;

    Ok(())
}


pub fn tenant_can_view_neuro(state: &State, tenant_id: &TenantId) -> bool {
    state
        .feature_flag_client
        .flag(BoolFlag::TenantCanViewNeuro(tenant_id))
}

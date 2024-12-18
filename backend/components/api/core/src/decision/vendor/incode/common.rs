use super::IncodeContext;
use crate::decision::vendor::into_fp_error;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::decision::vendor::verification_result::ShouldSaveVerificationRequest;
use crate::FpResult;
use crate::State;
use idv::incode::response::OnboardingStartResponse;
use idv::incode::IncodeClientErrorCustomFailureReasons;
use idv::incode::IncodeResponse;
use idv::incode::IncodeStartOnboardingRequest;
use newtypes::DecisionIntentId;
use newtypes::IncodeConfigurationId;
use newtypes::IncodeEnvironment;
use newtypes::ScopedVaultId;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;

impl SaveVerificationResultArgs {
    pub fn new_for_incode<T>(
        request_result_ok: Option<&IncodeResponse<T>>,
        vault_public_key: VaultPublicKey,
        should_save_verification_request: ShouldSaveVerificationRequest,
    ) -> Self
    where
        T: IncodeClientErrorCustomFailureReasons + serde::Serialize,
    {
        match request_result_ok {
            Some(response) => {
                let is_error = response.result.is_error();
                let raw_response = response.raw_response.clone();
                let scrubbed_response = response
                    .result
                    .scrub()
                    .map_err(into_fp_error)
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    is_error,
                    raw_response,
                    scrubbed_response,
                    should_save_verification_request,
                    vault_public_key,
                }
            }
            None => Self::error(should_save_verification_request, vault_public_key),
        }
    }

    pub fn from<'a, T>(
        request_result: &'a FpResult<IncodeResponse<T>>,
        // TODO make VendorAPI a function of T
        vendor_api: VendorAPI,
        ctx: &'a IncodeContext,
    ) -> Self
    where
        T: IncodeClientErrorCustomFailureReasons + serde::Serialize,
    {
        // We need to handle saving if
        // 1) if the Incode call fails (for some reason)
        // 2) if the Incode response succeeds but there's an error returned
        let di_id = ctx.di_id.clone();
        let vault_public_key = ctx.vault.public_key.clone();
        let sv_id = ctx.sv_id.clone();
        let doc_id = Some(ctx.id_doc_id.clone());
        let vreq = ShouldSaveVerificationRequest::Yes(vendor_api, di_id, sv_id, doc_id);
        let request_result = request_result.as_ref().ok();
        Self::new_for_incode(request_result, vault_public_key, vreq)
    }
}

#[tracing::instrument(skip(state, user_vault_public_key, tvc))]
pub async fn call_start_onboarding(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    user_vault_public_key: &VaultPublicKey,
    configuration_id: IncodeConfigurationId,
    environment: IncodeEnvironment,
) -> FpResult<OnboardingStartResponse> {
    let request = IncodeStartOnboardingRequest {
        credentials: tvc.incode_credentials(environment),
        configuration_id,
        session_id: None,
        custom_name_fields: None, /* TODO: this will be dropped from IncodeStartOnboardingRequest
                                   * altogether. Was originally for doc scan but we decided we don't need
                                   * even there */
    };
    let res = state
        .vendor_clients
        .incode
        .incode_start_onboarding
        .make_request(request)
        .await;

    let vreq = ShouldSaveVerificationRequest::Yes(
        VendorAPI::IncodeStartOnboarding,
        di_id.clone(),
        sv_id.clone(),
        None,
    );
    let vres = res.as_ref().ok();
    let args = SaveVerificationResultArgs::new_for_incode(vres, user_vault_public_key.clone(), vreq);

    args.save(&state.db_pool).await?;

    let res = res?.result.into_success().map_err(into_fp_error)?;
    Ok(res)
}

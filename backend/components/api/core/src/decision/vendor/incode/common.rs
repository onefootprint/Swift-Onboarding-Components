use super::IncodeContext;
use crate::decision::vendor::map_to_api_error;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::verification_result::{
    SaveVerificationResultArgs,
    ShouldSaveVerificationRequest,
};
use crate::errors::ApiResult;
use crate::State;
use idv::incode::response::OnboardingStartResponse;
use idv::incode::{
    IncodeClientErrorCustomFailureReasons,
    IncodeResponse,
    IncodeStartOnboardingRequest,
};
use newtypes::{
    DecisionIntentId,
    DocumentId,
    IncodeConfigurationId,
    IncodeEnvironment,
    ScopedVaultId,
    VaultPublicKey,
    VendorAPI,
};

impl SaveVerificationResultArgs {
    pub fn new<T>(
        request_result: &Result<IncodeResponse<T>, idv::incode::error::Error>,
        decision_intent_id: DecisionIntentId,
        scoped_vault_id: ScopedVaultId,
        identity_document_id: Option<DocumentId>,
        vault_public_key: VaultPublicKey,
        should_save_verification_request: ShouldSaveVerificationRequest,
    ) -> Self
    where
        T: IncodeClientErrorCustomFailureReasons + serde::Serialize,
    {
        match request_result {
            Ok(response) => {
                let is_error = response.result.is_error();
                let raw_response = response.raw_response.clone();
                let scrubbed_response = response
                    .result
                    .scrub()
                    .map_err(map_to_api_error)
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    is_error,
                    raw_response,
                    scrubbed_response,
                    should_save_verification_request,
                    decision_intent_id,
                    vault_public_key,
                    scoped_vault_id,
                    identity_document_id,
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
                identity_document_id,
            },
        }
    }

    pub fn from<'a, T>(
        request_result: &'a Result<IncodeResponse<T>, idv::incode::error::Error>,
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
        let decision_intent_id = ctx.di_id.clone();
        let vault_public_key = ctx.vault.public_key.clone();
        let scoped_vault_id = ctx.sv_id.clone();
        let identity_document_id = Some(ctx.id_doc_id.clone());
        Self::new(
            request_result,
            decision_intent_id,
            scoped_vault_id,
            identity_document_id,
            vault_public_key,
            ShouldSaveVerificationRequest::Yes(vendor_api),
        )
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
) -> ApiResult<OnboardingStartResponse> {
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

    let args = SaveVerificationResultArgs::new(
        &res,
        di_id.clone(),
        sv_id.clone(),
        None,
        user_vault_public_key.clone(),
        ShouldSaveVerificationRequest::Yes(VendorAPI::IncodeStartOnboarding),
    );

    args.save(&state.db_pool).await?;

    let res = res
        .map_err(map_to_api_error)?
        .result
        .into_success()
        .map_err(map_to_api_error)?;
    Ok(res)
}

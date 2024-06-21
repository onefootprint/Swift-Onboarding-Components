use crate::auth::session::AuthSessionData;
use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::types::ApiResponse;
use crate::utils::session::AuthSession;
use crate::FpResult;
use crate::State;
use api_core::auth::session::ob_config::OnboardingSession;
use api_core::auth::tenant::TenantGuard;
use db::models::ob_configuration::ObConfiguration;
use newtypes::ObConfigurationKey;
use newtypes::PreviewApi;
use newtypes::SessionAuthToken;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateOnboardingSessionRequest {
    pub key: ObConfigurationKey,
}

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct ObConfigSessionToken {
    /// a one-time use session token for onboarding a new user
    pub session_token: SessionAuthToken,
}

#[api_v2_operation(
    description = "Generates a single-use session token for a playbook.",
    tags(Onboarding, Preview)
)]
#[post("/onboarding/session")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: Json<CreateOnboardingSessionRequest>,
) -> ApiResponse<ObConfigSessionToken> {
    auth.check_preview_guard(PreviewApi::OnboardingSessionToken)?;
    let auth = auth.check_guard(TenantGuard::Onboarding)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;

    let (ob_config, tenant) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let result = ObConfiguration::get_enabled(conn, (&request.key, &tenant.id, is_live))?;
            Ok(result)
        })
        .await?;

    let session_data = AuthSessionData::OnboardingSession(OnboardingSession {
        ob_config_id: ob_config.id,
        tenant_id: tenant.id,
        is_live,
    });
    let session_token = AuthSession::create(&state, session_data, chrono::Duration::hours(1)).await?;
    Ok(ObConfigSessionToken { session_token })
}

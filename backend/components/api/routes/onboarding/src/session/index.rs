use crate::{
    auth::{
        session::AuthSessionData,
        tenant::{CheckTenantGuard, SecretTenantAuthContext},
    },
    errors::ApiResult,
    types::{response::ResponseData, JsonApiResponse},
    utils::session::AuthSession,
    State,
};
use api_core::auth::{session::ob_config::OnboardingSession, tenant::TenantGuard};
use db::models::ob_configuration::ObConfiguration;
use newtypes::{ObConfigurationKey, PreviewApi, SessionAuthToken};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateOnboardingSessionRequest {
    pub key: ObConfigurationKey,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
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
) -> JsonApiResponse<ObConfigSessionToken> {
    auth.check_preview_guard(PreviewApi::OnboardingSessionToken)?;
    let auth = auth.check_guard(TenantGuard::Onboarding)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;

    let (ob_config, tenant) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
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
    ResponseData::ok(ObConfigSessionToken { session_token }).json()
}

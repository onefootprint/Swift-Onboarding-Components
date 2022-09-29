use crate::auth::session::AuthSessionData;
use crate::auth::tenant::OnboardingSession;
use crate::auth::tenant::SecretTenantAuthContext;

use crate::auth::tenant::CheckTenantPermissions;

use crate::types::response::ResponseData;

use crate::types::JsonApiResponse;
use crate::utils::session::AuthSession;
use crate::State;

use db::models::ob_configuration::ObConfiguration;
use newtypes::ObConfigurationId;
use newtypes::SessionAuthToken;
use newtypes::TenantPermission;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateOnboardingSessionRequest {
    pub onboarding_config_id: ObConfigurationId,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ObConfigSessionToken {
    /// a one-time use session token for onboarding a new user
    pub session_token: SessionAuthToken,
}

#[api_v2_operation(
    summary = "/org/onboarding_session",
    operation_id = "org-onboarding_configs-id-session-token",
    description = "Generates a single-use session token for an onboarding configuration.",
    tags(PublicApi)
)]
#[post("/onboarding_session")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: Json<CreateOnboardingSessionRequest>,
) -> JsonApiResponse<ObConfigSessionToken> {
    let auth = auth.check_permissions(vec![TenantPermission::OnboardingConfiguration])?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;

    let (ob_config, tenant) = state
        .db_pool
        .db_transaction(move |conn| {
            ObConfiguration::get_enabled_by_id(
                conn,
                request.into_inner().onboarding_config_id,
                tenant.id,
                is_live,
            )
        })
        .await?;

    let session_data = AuthSessionData::OnboardingSession(OnboardingSession {
        onboarding_id: ob_config.id,
        tenant_id: tenant.id,
        is_live,
    });
    let session_token = AuthSession::create(&state, session_data, chrono::Duration::hours(1)).await?;
    ResponseData::ok(ObConfigSessionToken { session_token }).json()
}

use crate::auth::tenant::CheckTenantGuard;
use crate::types::ApiResponse;
use crate::utils::session::AuthSession;
use crate::FpResult;
use crate::State;
use api_core::auth::session::onboarding::OnboardingSession;
use api_core::auth::session::sdk_args::UserDataV1;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::telemetry::RootSpan;
use chrono::DateTime;
use chrono::Utc;
use db::models::ob_configuration::ObConfiguration;
use newtypes::preview_api;
use newtypes::ObConfigurationKey;
use newtypes::SessionAuthToken;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateOnboardingSessionRequest {
    /// Optionally, the playbook key that should be used for the onboarding.
    #[openapi(required)]
    pub key: Option<ObConfigurationKey>,
    /// Optionally, any user or business bootstrap data that you would like to pass into the
    /// onboarding flow.
    /// For information on what fields are available to bootstrap and their data formats, see [here](https://docs.onefootprint.com/articles/integrate/bootstrap-data).
    #[serde(default)]
    #[openapi(example = r#"{"id.first_name": "Jane", "id.last_name": "Doe"}"#)]
    #[openapi(optional)]
    pub bootstrap_data: UserDataV1,
}

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct CreateOnboardingSessionResponse {
    /// A short-lived onboarding session token that can be passed into the frontend SDK as an
    /// `authToken`. This token contains all information on the provided public key and/or bootstrap
    /// data provided.
    /// NOTE: treat this token as a secret as it allows viewing the provided bootstrap data.
    #[openapi(example = "botok_UxM6Vbvk2Rcy1gzcSuXgk3sj3L9I0pAnNH")]
    pub token: SessionAuthToken,
    pub expires_at: DateTime<Utc>,
}

#[api_v2_operation(tags(Onboarding, Preview, HideWhenLocked))]
#[post("/onboarding/session")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantApiKeyGated<preview_api::OnboardingSessionToken>,
    request: Json<CreateOnboardingSessionRequest>,
    root_span: RootSpan,
) -> ApiResponse<CreateOnboardingSessionResponse> {
    let auth = auth.check_guard(TenantGuard::Onboarding)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;
    let CreateOnboardingSessionRequest { key, bootstrap_data } = request.into_inner();

    let meta = key.is_some().then_some("has_key").unwrap_or("no_key");
    root_span.record("meta", meta);


    let sealing_key = state.session_sealing_key.clone();
    let (token, session) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            if let Some(key) = key.clone() {
                // Check ownership of Playbook
                ObConfiguration::get_enabled(conn, (&key, &tenant.id, is_live))?;
            }
            let data = OnboardingSession { key, bootstrap_data };
            let expires_in = chrono::Duration::hours(1);
            let session = AuthSession::create_sync(conn, &sealing_key, data, expires_in)?;
            Ok(session)
        })
        .await?;

    Ok(CreateOnboardingSessionResponse {
        token,
        expires_at: session.expires_at,
    })
}

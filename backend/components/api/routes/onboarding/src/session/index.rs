use crate::auth::tenant::CheckTenantGuard;
use crate::types::ApiResponse;
use crate::utils::session::AuthSession;
use crate::FpResult;
use crate::State;
use api_core::auth::session::onboarding::OnboardingSession;
use api_core::auth::session::onboarding::OnboardingSessionTrustedMetadata;
use api_core::auth::session::sdk_args::UserDataV1;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::errors::ValidationError;
use chrono::DateTime;
use chrono::Utc;
use db::models::ob_configuration::ObConfiguration;
use newtypes::preview_api;
use newtypes::ExternalId;
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
    /// The playbook key that should be used for the onboarding.
    pub key: ObConfigurationKey,
    /// Optionally, any user or business bootstrap data that you would like to pass into the
    /// onboarding flow.
    /// For information on what fields are available to bootstrap and their data formats, see [here](https://docs.onefootprint.com/articles/integrate/bootstrap-data).
    #[serde(default)]
    #[openapi(example = r#"{"id.first_name": "Jane", "id.last_name": "Doe"}"#)]
    #[openapi(optional)]
    pub bootstrap_data: UserDataV1,
    /// Allow the user to re-onboard onto this playbook even if they have already onboarded onto
    /// it. Defaults to false.
    // TODO: this is really weird that the default here is different from user-specific sessions
    #[serde(default)]
    #[openapi(optional)]
    pub allow_reonboard: bool,
    /// When using a KYB playbook, optionally this business's identifier in your own database.
    /// If a business with this external ID owned by the identified user already exists within the
    /// Footprint ecosystem, we will select it. If not, we will create a new business with this
    /// as its `external_id`.
    /// NOTE: the identified user must already own the business with this external ID or they will
    /// receive an error during onboarding.
    #[openapi(example = "null")]
    pub business_external_id: Option<ExternalId>,
}

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct CreateOnboardingSessionResponse {
    /// A short-lived onboarding session token that can be passed into the frontend SDK as a
    /// `authToken`. This token contains all information on the provided public key and/or bootstrap
    /// data provided.
    /// NOTE: treat this token as a secret as it allows viewing the provided bootstrap data.
    #[openapi(example = "pbtok_UxM6Vbvk2Rcy1gzcSuXgk3sj3L9I0pAnNH")]
    pub token: SessionAuthToken,
    pub expires_at: DateTime<Utc>,
}

#[api_v2_operation(tags(Onboarding, Preview, HideWhenLocked))]
#[post("/onboarding/session")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantApiKeyGated<preview_api::OnboardingSessionToken>,
    request: Json<CreateOnboardingSessionRequest>,
) -> ApiResponse<CreateOnboardingSessionResponse> {
    let auth = auth.check_guard(TenantGuard::Onboarding)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;
    let CreateOnboardingSessionRequest {
        key,
        bootstrap_data,
        allow_reonboard,
        business_external_id,
    } = request.into_inner();

    let sealing_key = state.session_sealing_key.clone();
    let (token, session) = state
        .db_query(move |conn| -> FpResult<_> {
            // Check ownership of Playbook
            let (obc, _) = ObConfiguration::get_enabled(conn, (&key, &tenant.id, is_live))?;
            if business_external_id.is_some() && !obc.kind.is_kyb() {
                return ValidationError("business_external_id is only supported for KYB playbooks").into();
            }
            let trusted_metadata = OnboardingSessionTrustedMetadata {
                allow_reonboard,
                business_external_id,
            };
            let data = OnboardingSession {
                key,
                bootstrap_data,
                trusted_metadata,
            };
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

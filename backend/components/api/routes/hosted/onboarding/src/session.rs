use api_core::auth::ob_config::ObSessionAuth;
use api_core::auth::session::onboarding::OnboardingSession;
use api_core::auth::session::sdk_args::UserDataV1;
use api_core::types::ApiResponse;
use newtypes::ObConfigurationKey;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::Apiv2Response;

#[derive(serde::Serialize, Debug, Apiv2Response, macros::JsonResponder)]
pub struct OnboardingSessionResponse {
    pub key: ObConfigurationKey,
    pub bootstrap_data: UserDataV1,
}

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Fetch information from an existing onboarding session token."
)]
#[get("/hosted/onboarding/session")]
fn get(session: ObSessionAuth) -> ApiResponse<OnboardingSessionResponse> {
    let OnboardingSession { key, bootstrap_data } = session.data.data;
    let result = OnboardingSessionResponse { key, bootstrap_data };
    Ok(result)
}

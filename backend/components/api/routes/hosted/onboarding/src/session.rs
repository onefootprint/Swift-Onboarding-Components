use api_core::auth::ob_config::ObSessionAuth;
use api_core::auth::session::onboarding::OnboardingSession;
use api_core::auth::session::sdk_args::UserDataV1;
use api_core::types::ApiResponse;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::Apiv2Response;

#[derive(serde::Serialize, Debug, Apiv2Response, macros::JsonResponder)]
pub struct OnboardingSessionResponse {
    pub bootstrap_data: UserDataV1,
}

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Fetch information from an existing onboarding session token."
)]
#[get("/hosted/onboarding/session")]
fn get(session: ObSessionAuth) -> ApiResponse<OnboardingSessionResponse> {
    let OnboardingSession {
        bootstrap_data,
        // Specifically do not serialize any trusted_metadata to the client since any values we send to the
        // client here can be spoofed.
        // trusted_metadata should instead be read by APIs that accept `ObSessionAuth` auth directly.
        trusted_metadata: _,
        // Specifically omit serializing the key - the client should send the onboarding session token as
        // `ObSessionAuth` in all requests that require playbook auth.
        key: _,
    } = session.data.data;
    let result = OnboardingSessionResponse { bootstrap_data };
    Ok(result)
}

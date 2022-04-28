use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::onboarding_token::OnboardingSessionTokenContext, errors::ApiError};
use paperclip::actix::{api_v2_operation, post, web, Apiv2Schema};


#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct CommitResponse {
    /// Unique footprint user id
    footprint_user_id: String,
}

#[api_v2_operation]
#[post("/commit")]
async fn handler(
    onboarding_token_auth: OnboardingSessionTokenContext,
    _state: web::Data<State>,
) -> actix_web::Result<ApiResponseData<CommitResponse>, ApiError> {
    let onboarding = onboarding_token_auth.onboarding();

    Ok(ApiResponseData {
        data: CommitResponse {
            footprint_user_id: onboarding.footprint_user_id.clone(),
        },
    })
}

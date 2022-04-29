use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::onboarding_token::OnboardingSessionTokenContext, errors::ApiError};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};


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
) -> actix_web::Result<Json<ApiResponseData<CommitResponse>>, ApiError> {
    // TODO validate that the whole user vault is filled out to the tenant's specifications
    let onboarding = onboarding_token_auth.onboarding();

    Ok(Json(ApiResponseData {
        data: CommitResponse {
            footprint_user_id: onboarding.user_ob_id.clone(),
        },
    }))
}

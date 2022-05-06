use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::onboarding_session::OnboardingSessionContext, errors::ApiError};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct CommitResponse {
    /// Unique footprint user id
    footprint_user_id: String,
}

#[api_v2_operation]
#[post("/commit")]
/// Finish onboarding the user. Returns the footprint_user_id for login. If any necessary
/// attributes were not set, returns an error with the list of missing fields.
async fn handler(
    session_context: OnboardingSessionContext,
    _state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<CommitResponse>>, ApiError> {
    let onboarding = session_context.onboarding();
    let uv = session_context.user_vault();

    let missing_fields = db::models::user_vaults::MissingFields::missing_fields(uv);

    match missing_fields.len() {
        0 => Ok(Json(ApiResponseData {
            data: CommitResponse {
                footprint_user_id: onboarding.user_ob_id.clone(),
            },
        })),
        _ => Err(ApiError::UserMissingRequiredFields(
            missing_fields.join(","),
        )),
    }
}

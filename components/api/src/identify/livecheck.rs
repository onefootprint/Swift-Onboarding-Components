use crate::auth::onboarding_session::OnboardingSessionContext;
use crate::errors::ApiError;
use crate::response::success::ApiResponseData;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct LivecheckResponse {
    session_id: String,
}

/// Challenge via biometrics + liveness
#[api_v2_operation]
#[post("/livecheck")]
pub async fn handler(
    session_context: OnboardingSessionContext,
) -> actix_web::Result<Json<ApiResponseData<LivecheckResponse>>, ApiError> {
    Ok(Json(ApiResponseData {
        data: LivecheckResponse {
            session_id: session_context.session_id,
        },
    }))
}

use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::onboarding_session::OnboardingSessionContext, errors::ApiError};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use uuid::Uuid;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct ChallengeVerifyRequest {
    code: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct ChallengeVerifyPath {
    challenge_id: Uuid,
}

#[api_v2_operation]
#[post("/{challenge_id}/verify")]
async fn handler(
    state: web::Data<State>,
    onboarding_token_auth: OnboardingSessionContext,
    path: web::Path<ChallengeVerifyPath>,
    request: Json<ChallengeVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<()>>, ApiError> {
    let ChallengeVerifyPath { challenge_id } = path.into_inner();
    let user_vault = onboarding_token_auth.user_vault();
    db::challenge::verify(
        &state.db_pool,
        challenge_id,
        user_vault.id.clone(),
        request.into_inner().code,
    )
    .await?;
    Ok(Json(ApiResponseData { data: () }))
}

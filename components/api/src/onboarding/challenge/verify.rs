use crate::{
    auth::onboarding_token::OnboardingSessionTokenContext,
    errors::ApiError,
};
use crate::response::success::ApiResponseData;
use crate::State;
use uuid::Uuid;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};


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
    onboarding_token_auth: OnboardingSessionTokenContext,
    path: web::Path<ChallengeVerifyPath>,
    request: Json<ChallengeVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<()>>, ApiError> {
    let ChallengeVerifyPath{challenge_id} = path.into_inner();
    let user_vault = onboarding_token_auth.user_vault();
    db::challenge::verify(&state.db_pool, challenge_id, user_vault.id.clone(), request.into_inner().code)
        .await?;
    // TODO yield auth token in one-click flow, and probably create a new UserTenantVerification
    Ok(Json(ApiResponseData{
        data: (),
    }))
}
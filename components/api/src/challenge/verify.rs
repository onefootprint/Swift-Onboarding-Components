use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web, Responder,
};
use uuid::Uuid;


#[derive(Debug, Clone, serde::Deserialize)]
struct ChallengeVerificationRequest {
    code: String,
    tenant_pub_key: String,
}

#[derive(Debug, Clone, serde::Serialize)]
struct ChallengeVerificationResponse {
    tenant_user_auth_token: String,
}

#[post("/user/{user_id}/challenge/{challenge_id}/verify")]
async fn handler(
    state: web::Data<State>,
    path: web::Path<(String, Uuid)>,
    request: web::Json<ChallengeVerificationRequest>,
) -> Result<impl Responder, ApiError> {
    db::tenant::pub_auth_check(&state.db_pool, request.tenant_pub_key.clone()).await?;

    let (user_id, challenge_id) = path.into_inner();
    tracing::info!(
        "in challenge verification with user_id {} challenge_id {}",
        user_id.clone(),
        challenge_id
    );

    let request = request;
    db::challenge::verify(&state.db_pool, challenge_id, user_id.clone(), request.into_inner().code)
        .await?;
    // TODO yield auth token in one-click flow, and probably create a new UserTenantVerification
    Ok(web::Json("verified! one day this will have an auth token"))
}
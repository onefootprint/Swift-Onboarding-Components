use crate::{auth::pk_tenant::PublicTenantAuthContext, errors::ApiError};
use crate::response::success::ApiResponseData;
use crate::State;
use actix_web::{
    post, web
};
use uuid::Uuid;


#[derive(Debug, Clone, serde::Deserialize)]
struct ChallengeVerificationRequest {
    code: String,
}

#[derive(Debug, Clone, serde::Serialize)]
struct ChallengeVerificationResponse {
    tenant_user_auth_token: String,
}

#[post("/user/{tenant_user_id}/challenge/{challenge_id}/verify")]
async fn handler(
    state: web::Data<State>,
    pub_tenant_auth: PublicTenantAuthContext,
    path: web::Path<(String, Uuid)>,
    request: web::Json<ChallengeVerificationRequest>,
) -> Result<ApiResponseData<String>, ApiError> {
    let (tenant_user_id, challenge_id) = path.into_inner();
    tracing::info!(
        "in challenge verification with user_id {} challenge_id {}",
        tenant_user_id.clone(),
        challenge_id
    );

    let request = request;
    let user = db::user::get_by_tenant_user_id(&state.db_pool, tenant_user_id, pub_tenant_auth.tenant().id.clone()).await?;
    db::challenge::verify(&state.db_pool, challenge_id, user.id, request.into_inner().code)
        .await?;
    // TODO yield auth token in one-click flow, and probably create a new UserTenantVerification
    Ok(ApiResponseData{
        data: "verified! one day this will have an auth token".to_string()
    })
}
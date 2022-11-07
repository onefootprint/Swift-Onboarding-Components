use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope, UserAuthScopeDiscriminant};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use chrono::{DateTime, Utc};
use newtypes::UserVaultId;
use paperclip::actix::{self, api_v2_operation, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct TokenResponse {
    pub user_vault_id: UserVaultId,
    pub scopes: Vec<UserAuthScopeDiscriminant>,
    pub expires_at: DateTime<Utc>,
}

#[api_v2_operation(tags(Hosted), description = "Returns information about a given auth token.")]
#[actix::get("/hosted/user/token")]
pub async fn get(
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<TokenResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp, UserAuthScope::BasicProfile])?;

    Ok(Json(ResponseData::ok(TokenResponse {
        user_vault_id: user_auth.user_vault_id(),
        expires_at: user_auth.expires_at(),
        scopes: user_auth.data.scopes(),
    })))
}

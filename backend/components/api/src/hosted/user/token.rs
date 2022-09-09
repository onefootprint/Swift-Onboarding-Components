use crate::auth::session_data::user::UserAuthScope;
use crate::auth::{UserAuth, VerifiedUserAuth};
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use chrono::{DateTime, Utc};
use newtypes::UserVaultId;
use paperclip::actix::{api_v2_operation, get, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct TokenResponse {
    pub user_vault_id: UserVaultId,
    pub scopes: Vec<UserAuthScope>,
    pub expires_at: DateTime<Utc>,
}

#[api_v2_operation(
    summary = "/hosted/user/token",
    operation_id = "hosted-user-token",
    tags(Hosted),
    description = "Returns information about a given auth token."
)]
#[get("token")]
pub fn get(user_auth: UserAuth) -> actix_web::Result<Json<ApiResponseData<TokenResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp, UserAuthScope::BasicProfile])?;

    Ok(Json(ApiResponseData::ok(TokenResponse {
        user_vault_id: user_auth.user_vault_id(),
        scopes: user_auth.data.scopes,
        expires_at: user_auth.expires_at,
    })))
}

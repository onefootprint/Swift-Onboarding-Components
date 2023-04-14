use crate::auth::user::{UserAuth, UserAuthContext, UserAuthGuard};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use api_core::auth::IsGuardMet;
use chrono::{DateTime, Utc};
use newtypes::VaultId;
use paperclip::actix::{self, api_v2_operation, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct TokenResponse {
    pub user_vault_id: VaultId,
    pub scopes: Vec<UserAuthGuard>,
    pub expires_at: DateTime<Utc>,
}

#[api_v2_operation(tags(Hosted), description = "Returns information about a given auth token.")]
#[actix::get("/hosted/user/token")]
pub async fn get(
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<TokenResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp.or(UserAuthGuard::BasicProfile))?;
    let scopes = user_auth.scopes.iter().map(|x| x.into()).collect();

    Ok(Json(ResponseData::ok(TokenResponse {
        user_vault_id: user_auth.user_vault_id().clone(),
        expires_at: user_auth.expires_at(),
        scopes,
    })))
}

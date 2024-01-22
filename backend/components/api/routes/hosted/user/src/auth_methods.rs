use crate::auth::user::{UserAuthContext, UserAuthGuard};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use chrono::{DateTime, Utc};
use newtypes::AuthMethodKind;
use paperclip::actix::{self, api_v2_operation, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct AuthMethod {
    pub kind: AuthMethodKind,
    pub is_verified: bool,
}

#[api_v2_operation(
    tags(User, Hosted),
    description = "Returns information about the auth methods this user has registered."
)]
#[actix::get("/hosted/user/auth_methods")]
pub async fn get(user_auth: UserAuthContext) -> JsonApiResponse<Vec<AuthMethod>> {
    let user_auth = user_auth.check_guard(UserAuthGuard::Auth)?;

    Ok(Json(ResponseData::ok(TokenResponse {
        expires_at: user_auth.expires_at(),
        scopes,
    })))
}

use chrono::{DateTime, Utc};
use newtypes::{RequestedTokenScope, SessionAuthToken, UserAuthGuard};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct GetUserTokenResponse {
    // NOTE: this must be UserAuthGuard, UserAuthScope's serialization is messed up.
    pub scopes: Vec<UserAuthGuard>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateUserTokenRequest {
    pub requested_scope: RequestedTokenScope,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct CreateUserTokenResponse {
    pub token: SessionAuthToken,
    pub expires_at: DateTime<Utc>,
}

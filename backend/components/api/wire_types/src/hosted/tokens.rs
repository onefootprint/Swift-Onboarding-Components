use chrono::DateTime;
use chrono::Utc;
use newtypes::RequestedTokenScope;
use newtypes::SessionAuthToken;
use newtypes::UserAuthScope;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct GetUserTokenResponse {
    pub scopes: Vec<UserAuthScope>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateUserTokenRequest {
    pub requested_scope: RequestedTokenScope,
}

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct CreateUserTokenResponse {
    pub token: SessionAuthToken,
    pub expires_at: DateTime<Utc>,
}

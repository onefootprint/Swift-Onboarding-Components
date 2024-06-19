use chrono::{
    DateTime,
    Utc,
};
use newtypes::{
    RequestedTokenScope,
    SessionAuthToken,
    UserAuthScope,
};
use paperclip::actix::{
    Apiv2Response,
    Apiv2Schema,
};

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

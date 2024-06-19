use chrono::{
    DateTime,
    Utc,
};
use newtypes::SessionAuthToken;
use paperclip::actix::Apiv2Response;

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, Apiv2Response, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct CreateSdkArgsTokenResponse {
    /// The short-lived token that gives temporary access to perform operations for this user
    pub token: SessionAuthToken,
    /// The time at which the token expires
    pub expires_at: DateTime<Utc>,
}

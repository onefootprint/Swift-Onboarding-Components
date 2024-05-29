use chrono::{
    DateTime,
    Utc,
};
use newtypes::SessionAuthToken;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateSdkArgsTokenResponse {
    /// The short-lived token that gives temporary access to perform operations for this user
    pub token: SessionAuthToken,
    /// The time at which the token expires
    pub expires_at: DateTime<Utc>,
}

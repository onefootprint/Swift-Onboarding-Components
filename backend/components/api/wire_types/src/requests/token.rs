use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateTokenRequest {
    /// The publishable key of the playbook onto which you would like this user to onboard.
    /// The user will be asked to provide any missing information required by playbook.
    /// If you provide the key here, you can omit providing it in your frontend Footprint.js integration.
    pub key: Option<ObConfigurationKey>,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateTokenResponse {
    /// The short-lived token that gives temporary access to perform operations for this user
    pub token: SessionAuthToken,
    /// The time at which the token expires
    pub expires_at: DateTime<Utc>,
}

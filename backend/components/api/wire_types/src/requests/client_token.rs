use std::collections::HashSet;

use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum ClientTokenScopeKind {
    Vault,
    Decrypt,
    DecryptDownload,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ClientTokenRequest {
    /// List of data identifiers to which this token will have access. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    pub fields: HashSet<DataIdentifier>,
    /// Time to live until this token expires, provided in seconds. Defaults to 30 minutes. Must be at least 60 seconds, at most 1 day
    #[openapi(example = "300")]
    pub ttl: Option<u32>,
    /// Specify whether this token should be allowed to vault, decrypt, or both
    pub scopes: Vec<ClientTokenScopeKind>,
    /// If the token is allowed to decrypt, provide a default decryption reason
    pub decrypt_reason: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ClientTokenResponse {
    /// The short-lived token that gives temporary access to perform operations for this user
    pub token: SessionAuthToken,
    /// The time at which the token expires
    pub expires_at: DateTime<Utc>,
}

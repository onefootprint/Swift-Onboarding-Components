use std::collections::HashSet;

use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum DEPRECATEDClientTokenScopeKind {
    Vault,
    Decrypt,
    DecryptDownload,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum ModernClientTokenScopeKind {
    /// Allow vaulting the provided fields
    Vault,
    /// Allow decrypting the provided fields
    Decrypt,
    /// Provide both vault and decrypt permissions
    VaultAndDecrypt,
    /// Provides the ability to download the contents of a single DI as a file
    DecryptDownload,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateClientTokenRequest {
    /// List of data identifiers to which this token will have access. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    pub fields: HashSet<DataIdentifier>,
    /// Time to live until this token expires, provided in seconds. Defaults to 30 minutes. Must be at least 60 seconds, at most 1 day
    #[openapi(example = "300")]
    pub ttl: Option<u32>,
    #[openapi(skip)]
    #[serde(default)]
    /// DEPRECATED
    pub scopes: Vec<DEPRECATEDClientTokenScopeKind>,
    #[openapi(required)]
    /// Specify whether this token should be allowed to vault, decrypt, or both
    pub scope: Option<ModernClientTokenScopeKind>,
    /// If the token is allowed to decrypt, provide a default decryption reason
    pub decrypt_reason: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateClientTokenResponse {
    /// The short-lived token that gives temporary access to perform operations for this user
    pub token: SessionAuthToken,
    /// The time at which the token expires
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct GetClientTokenResponse {
    /// The list of fields that are allowed to be vaulted by this token
    pub vault_fields: Vec<DataIdentifier>,
    /// The time at which this token will expire.
    pub expires_at: DateTime<Utc>,
    pub tenant: GetClientTokenResponseTenant,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct GetClientTokenResponseTenant {
    pub name: String,
}

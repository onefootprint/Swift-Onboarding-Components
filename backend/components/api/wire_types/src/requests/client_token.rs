use crate::*;
use newtypes::DataIdentifier;
use newtypes::SessionAuthToken;
use newtypes::UserDataIdentifier;
use std::collections::HashSet;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
/// This is deprecated in the API. New clients should be providing ModernClientTokenScopeKind
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
    /// Shorthand to vault card fields, generating a random card alias
    VaultCard,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateClientTokenRequest {
    /// List of data identifiers to which this token will have access. For example, `id.first_name`,
    /// `id.ssn4`, `custom.bank_account`. Should not be specified when using the `vault_card`
    /// scope.
    #[serde(default)]
    #[openapi(serialize_as = "Option<Vec<UserDataIdentifier>>")]
    pub fields: HashSet<DataIdentifier>,
    /// Time to live until this token expires, provided in seconds. Defaults to 30 minutes. Must be
    /// at least 60 seconds, at most 1 day
    #[openapi(example = "300")]
    pub ttl: Option<u32>,
    #[openapi(skip)]
    #[serde(default)]
    /// DEPRECATED
    pub scopes: Vec<DEPRECATEDClientTokenScopeKind>,
    #[openapi(required)]
    /// Specify the permissions of this token.
    /// - `vault` allows writing to the specified fields.
    /// - `decrypt` allows decrypting the specified fields.
    /// - `vault_and_decrypt` allows both.
    /// - `decrypt_download` allows decrypting a single piece of data as a file.
    /// - `vault_card` is a shorthand to generate a token to vault a card with a random alias.
    pub scope: Option<ModernClientTokenScopeKind>,
    /// If the token is allowed to decrypt, provide a default decryption reason
    pub decrypt_reason: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Response, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct CreateClientTokenResponse {
    /// The short-lived token that gives temporary access to perform operations for this user
    // nosemgrep
    #[openapi(example = "cttok_UxM6Vbvk2Rcy1gzcSuXgk3sj3L9I0pAnNH")]
    pub token: SessionAuthToken,
    /// The time at which the token expires
    pub expires_at: DateTime<Utc>,
    /// The fields that this token has permissions to operate on, according to the requested scope.
    #[openapi(example = r#"["id.first_name","id.last_name"]"#)]
    #[openapi(serialize_as = "Option<Vec<UserDataIdentifier>>")]
    pub fields: Vec<DataIdentifier>,
}

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct GetClientTokenResponse {
    /// The list of fields that are allowed to be vaulted by this token
    pub vault_fields: Vec<DataIdentifier>,
    /// The time at which this token will expire.
    pub expires_at: DateTime<Utc>,
    pub tenant: GetClientTokenResponseTenant,
}

#[derive(Debug, Clone, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct GetClientTokenResponseTenant {
    pub name: String,
}

use crate::*;
use newtypes::{
    ApiKeyStatus,
    DataIdentifier,
    PiiString,
    ProxyConfigSecretHeaderId,
    ProxyIngressContentType,
};

/// Create a new proxy configuration
#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct GetProxyConfigRequest {
    pub status: Option<ApiKeyStatus>,
}

/// Create a new proxy configuration
#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateProxyConfigRequest {
    /// a friendly name for this proxy config
    pub name: String,

    /// The proxy destination URL. Can include path and query params
    pub url: String,

    /// HTTP method: POST, GET, PUT, PATCH, DELETE
    pub method: String,

    /// Custom headers
    #[serde(default)]
    pub headers: Vec<PlainCustomHeader>,

    /// Custom headers containing auth secrets
    #[serde(default)]
    pub secret_headers: Vec<SecretCustomHeader>,

    /// A certificate and key to authenticate via mTLS. Omit to skip client-certificate
    /// authentication
    pub client_identity: Option<ClientIdentity>,

    /// A list of PEM-encoded x509 certificates or chains that are either CAs or self-signed. These
    /// certificates will be used to verify the root-of-trust of the certificate presented by the
    /// proxy
    #[serde(default)]
    pub pinned_server_certificates: Vec<String>,

    /// access reason to use during proxy decryptions
    pub access_reason: Option<String>,

    /// Ingress configuration
    pub ingress_settings: Option<IngressSettings>,
}

/// PEM encoded client certificate and key
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct ClientIdentity {
    /// PEM encoded x509 cert
    pub certificate: String,
    /// PEM encoded key
    pub key: String,
}

/// a plain header to forward to the proxy
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct PlainCustomHeader {
    /// header name
    pub name: String,
    /// header value
    pub value: String,
}

/// a secret header to forward to the proxy
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct SecretCustomHeader {
    /// header name
    pub name: String,
    /// header value
    pub value: PiiString,
}

/// A proxy ingress parsing and vaulting rule
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct IngressSettings {
    /// Ingress content type
    pub content_type: ProxyIngressContentType,

    /// Ingress rules
    pub rules: Vec<ProxyIngressRule>,
}

/// A proxy ingress parsing and vaulting rule
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct ProxyIngressRule {
    /// the token data identifier to vault as
    pub token: DataIdentifier,
    /// the target path to extract
    pub target: String,
}

/// Patch a new proxy configuration
#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct PatchProxyConfigRequest {
    /// enable or disable the config
    pub status: Option<ApiKeyStatus>,

    /// a friendly name for this proxy config
    pub name: Option<String>,

    /// the proxy destination URL
    /// Can include path and query params
    pub url: Option<String>,

    /// HTTP method: POST, GET, PUT, PATCH, DELETE
    pub method: Option<String>,

    /// Custom headers
    pub headers: Option<Vec<PlainCustomHeader>>,

    /// Custom headers containing auth secrets to add
    pub add_secret_headers: Option<Vec<SecretCustomHeader>>,

    /// A list of secret headers to delete (by it's ID)
    pub delete_secret_headers: Option<Vec<ProxyConfigSecretHeaderId>>,

    /// A certificate and key to authenticate via mTLS
    /// omit to not make changes, set to null to remove
    pub client_identity: Option<Option<ClientIdentity>>,

    /// A list of PEM-encoded x509 certificates or chains
    /// that are either CAs or self-signed. These certificates
    /// will be used to verify the root-of-trust of the certificate
    /// presented by the proxy
    pub pinned_server_certificates: Option<Vec<String>>,

    /// access reason to use during proxy decryptions
    pub access_reason: Option<String>,

    /// Ingress configuration
    /// omit to not change, set to null to remove
    pub ingress_settings: Option<Option<IngressSettings>>,
}

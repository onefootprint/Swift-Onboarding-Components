use crate::*;
use newtypes::ApiKeyStatus;
use newtypes::DataIdentifier;
use newtypes::PiiString;
use newtypes::ProxyConfigSecretHeaderId;
use newtypes::ProxyIngressContentType;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct GetProxyConfigRequest {
    pub status: Option<ApiKeyStatus>,
}

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

    /// Access reason to use during proxy decryptions
    pub access_reason: Option<String>,

    pub ingress_settings: Option<IngressSettings>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct ClientIdentity {
    /// PEM encoded x509 cert
    pub certificate: String,
    /// PEM encoded key
    pub key: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct PlainCustomHeader {
    /// header name
    pub name: String,
    /// header value
    pub value: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct SecretCustomHeader {
    /// header name
    pub name: String,
    /// header value
    pub value: PiiString,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct IngressSettings {
    /// Ingress content type
    pub content_type: ProxyIngressContentType,

    /// Ingress rules
    pub rules: Vec<ProxyIngressRule>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
pub struct ProxyIngressRule {
    /// The token data identifier to vault as
    pub token: DataIdentifier,
    /// The target path to extract
    pub target: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct PatchProxyConfigRequest {
    /// Enable or disable the config
    pub status: Option<ApiKeyStatus>,

    /// A friendly name for this proxy config
    pub name: Option<String>,

    /// The proxy destination URL. Can include path and query params
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

    /// Access reason to use during proxy decryptions
    pub access_reason: Option<String>,

    /// Ingress configuration
    /// omit to not change, set to null to remove
    pub ingress_settings: Option<Option<IngressSettings>>,
}

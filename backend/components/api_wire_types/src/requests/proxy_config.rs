use crate::*;

/// Create a new proxy configuration
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct CreateProxyConfigRequest {
    /// a friendly name for this proxy config
    pub name: String,

    /// the proxy destination URL
    /// Can include path and query params
    pub url: String,

    /// HTTP method: POST, GET, PUT, PATCH, DELETE
    pub method: String,

    /// Custom headers
    pub headers: Vec<PlainCustomHeader>,

    /// Custom headers containing auth secrets
    pub secret_headers: Vec<SecretCustomHeader>,

    /// A certificate and key to authenticate via mTLS
    /// Omit to skip client-certificate authentication
    pub client_identity: Option<ClientIdentity>,

    /// A list of PEM-encoded x509 certificates or chains
    /// that are either CAs or self-signed. These certificates
    /// will be used to verify the root-of-trust of the certificate
    /// presented by the proxy
    pub pinned_server_certificates: Vec<String>,

    /// access reason to use during proxy decryptions
    pub access_reason: Option<String>,

    /// Ingress configuration
    pub ingress_settings: Option<IngressSettings>,
}

/// PEM encoded client certificate and key
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct ClientIdentity {
    /// PEM encoded x509 cert
    pub certificate: String,
    /// PEM encoded key
    pub key: String,
}

/// a plain header to forward to the proxy
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct PlainCustomHeader {
    /// header name
    pub name: String,
    /// header value
    pub value: String,
}

/// a secret header to forward to the proxy
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct SecretCustomHeader {
    /// header name
    pub name: String,
    /// header value
    pub value: PiiString,
}

/// A proxy ingress parsing and vaulting rule
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct IngressSettings {
    /// Ingress content type
    pub content_type: ProxyIngressContentType,

    /// Ingress rules
    pub rules: Vec<ProxyIngressRule>,
}

/// A proxy ingress parsing and vaulting rule
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct ProxyIngressRule {
    #[schemars(with = "String")]
    /// the token data identifier to vault as
    pub token: DataIdentifier,
    /// the target path to extract
    pub target: String,
}

export_schema!(CreateProxyConfigRequest);
export_schema!(ClientIdentity);
export_schema!(PlainCustomHeader);
export_schema!(SecretCustomHeader);
export_schema!(ProxyIngressRule);

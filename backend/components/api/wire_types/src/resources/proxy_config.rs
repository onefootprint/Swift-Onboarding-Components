use crate::*;
use newtypes::{
    ApiKeyStatus,
    ProxyConfigId,
    ProxyConfigSecretHeaderId,
    ProxyIngressContentType,
};

/// Proxy configuration
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct ProxyConfigBasic {
    pub id: ProxyConfigId,
    pub is_live: bool,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub status: ApiKeyStatus,
    pub url: String,
    pub method: String,
    pub deactivated_at: Option<DateTime<Utc>>,
}

/// Proxy configuration
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct ProxyConfigDetailed {
    pub id: ProxyConfigId,
    pub is_live: bool,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub status: ApiKeyStatus,
    pub deactivated_at: Option<DateTime<Utc>>,

    /// Proxy URL
    pub url: String,
    /// Http method to use when making the proxy request
    pub method: String,

    /// PEM encoded client certificate
    pub client_certificate: Option<String>,

    /// Custom headers
    pub headers: Vec<PlainCustomHeader>,

    /// Custom headers containing auth secrets
    pub secret_headers: Vec<OmittedSecretCustomHeader>,

    /// A list of PEM-encoded x509 certificates or chains that are either CAs or self-signed. These
    /// certificates will be used to verify the root-of-trust of the certificate presented by the
    /// proxy.
    pub pinned_server_certificates: Vec<String>,

    /// The reason to use for decryptions that occur during proxying.
    pub access_reason: Option<String>,

    /// The content type expected to be received from responses from the upstream.
    pub ingress_content_type: Option<ProxyIngressContentType>,

    pub ingress_rules: Vec<ProxyIngressRule>,
}

/// a secret header to forward to the proxy
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OmittedSecretCustomHeader {
    /// Identifier for the secret header
    pub id: ProxyConfigSecretHeaderId,
    /// Header name
    pub name: String,
}

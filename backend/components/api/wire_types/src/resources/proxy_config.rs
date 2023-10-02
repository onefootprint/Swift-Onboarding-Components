use crate::*;

/// Proxy configuration
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

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
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct ProxyConfigDetailed {
    pub id: ProxyConfigId,
    pub is_live: bool,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub status: ApiKeyStatus,
    pub deactivated_at: Option<DateTime<Utc>>,

    /// proxy url
    pub url: String,
    /// proxy http method
    pub method: String,

    /// PEM encoded client certificate
    pub client_certificate: Option<String>,

    /// Custom headers
    pub headers: Vec<PlainCustomHeader>,

    /// Custom headers containing auth secrets
    pub secret_headers: Vec<OmittedSecretCustomHeader>,

    /// A list of PEM-encoded x509 certificates or chains
    /// that are either CAs or self-signed. These certificates
    /// will be used to verify the root-of-trust of the certificate
    /// presented by the proxy
    pub pinned_server_certificates: Vec<String>,

    /// access reason to use during proxy decryptions
    pub access_reason: Option<String>,

    /// ingress type
    pub ingress_content_type: Option<ProxyIngressContentType>,

    /// Ingress rules
    pub ingress_rules: Vec<ProxyIngressRule>,
}

/// a secret header to forward to the proxy
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, JsonSchema)]
pub struct OmittedSecretCustomHeader {
    /// identifier for the secret header
    pub id: ProxyConfigSecretHeaderId,
    /// header name
    pub name: String,
}

export_schema!(ProxyConfigBasic);
export_schema!(ProxyConfigDetailed);
export_schema!(OmittedSecretCustomHeader);

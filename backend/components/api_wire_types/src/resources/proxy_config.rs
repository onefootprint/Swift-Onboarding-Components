use crate::*;

/// Proxy configuration
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct ProxyConfig {
    pub id: ProxyConfigId,
    pub is_live: bool,
    pub name: String,
    pub created_at: DateTime<Utc>,

    /// proxy url
    pub url: String,
    /// proxy http method
    pub method: String,

    /// PEM encoded client certificate
    pub client_certificate: Option<String>,

    /// ingress type
    pub ingress_content_type: Option<ProxyIngressContentType>,

    /// access reason
    pub access_reason: Option<String>,
}

export_schema!(ProxyConfig);

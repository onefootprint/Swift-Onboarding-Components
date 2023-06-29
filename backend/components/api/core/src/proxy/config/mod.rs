use actix_web::{http::header::HeaderMap, FromRequest};

use futures::Future;
use newtypes::{ApiKeyStatus, FpId, PiiString, ProxyConfigId, ProxyIngressContentType};
use paperclip::v2::models::{DefaultSchemaRaw, Parameter};
use reqwest::Method;
use std::{pin::Pin, str::FromStr};
use strum::EnumString;
use url::Url;

use crate::{
    api_headers_schema,
    auth::tenant::TenantAuth,
    errors::{proxy::VaultProxyError, ApiError, ApiResult},
    utils::headers::{get_header, get_required_header},
    State,
};

use self::{
    certificates::{ParsedClientCertificate, PinnedServerCertificates},
    ingress_rule::IngressRule,
};
use self::{fwd_headers::ForwardProxyHeaders, ingress_rule::ParsedIngressRules};

mod certificates;
pub use self::certificates::ClientCertificateKey;

mod fwd_headers;
pub mod ingress_rule;

api_headers_schema! {
    pub mod proxy_headers {
        /// Target proxy destination URL
        /// Required if "just-in-time" OR ignored if using proxy configuration
        #[required = true]
        EGRESS_URL_HEADER_NAME = "x-fp-proxy-target-url";

        /// HTTP Method VERB for the proxy destination request (defaults to POST)
        #[required = false]
        EGRESS_METHOD_HEADER_NAME = "x-fp-proxy-method";

        /// Egress destination URL path and query string to append
        #[required = false]
        EGRESS_PATH_AND_QUERY = "x-fp-path-and-query";

        /// Content-type for the proxy ingress
        #[required = false]
        INGRESS_CONTENT_TYPE = "x-fp-proxy-ingress-content-type";

        /// Access reason for any egress decryption operations during the proxy request
        #[required = false]
        ACCESS_REASON = "x-fp-proxy-access-reason";

        /// When proxy requests are on behalf of a single footprint vault, you can
        /// can omit the `fp_id_` prefix on token identifiers, and just use `id.x` or `custom.y` instead
        /// of `fp_id_xyz.id.x` or `fp_id_xyz.custom.y`.
        ///
        /// Similarly, if specifying proxy configuration ingress rules from a stored configuration
        /// the corresponding token must be assigned just-in-time via a headers
        ///
        /// i.e: `x-fp-proxy-footprint-token: fp_id_abc`
        #[required = false]
        USER_TOKEN_ASSIGNMENT_HEADER = "x-fp-proxy-footprint-token";

        /// Configure one more ingress rules
        ///
        /// x-fp-proxy-ingress-rule: fp_id_abc.custom.credit_card_number=$.data.card.number
        /// x-fp-proxy-ingress-rule: fp_id_abc.custom.credit_card_exp=$.data.card.expiration
        /// x-fp-proxy-ingress-rule: fp_id_abc.custom.credit_card_cvc=$.data.card.security_code
        #[required = false]
        INGRESS_RULE_HEADER = "x-fp-proxy-ingress-rule";

        /// Prefixes custom headers to forward along egress
        /// For example `x-fp-proxy-fwd-MYHEADER: hello world` sends `MYHEADER: hello world` to the destination
        #[required = false]
        FORWARD_HEADER_PREFIX = "x-fp-proxy-fwd-";

        /// Base64 encoded PEM client certificate to use (required if using key)
        #[required = false]
        PROXY_CLIENT_CERT_HEADER = "x-fp-proxy-client-cert";

        /// Base64 encoded PEM client key to use (required if using cert)
        #[required = false]
        PROXY_CLIENT_KEY_HEADER = "x-fp-proxy-client-key";

        /// Configure one or more base64 encoded PEM server certificates to validate and pin
        /// proxy destination TLS connections.
        #[required = false]
        PROXY_PIN_SERVER_CERT_HEADER = "x-fp-proxy-pin-cert";
    }
}

// helper function to get method
pub fn get_proxy_method_or_default(headers: &HeaderMap, default: Method) -> Method {
    get_header(proxy_headers::EGRESS_METHOD_HEADER_NAME, headers)
        .and_then(|m| Method::from_str(&m).ok())
        .unwrap_or(default)
}

#[derive(Debug, Clone)]
pub struct ProxyConfig {
    /// the source of the configuration if not JIT
    pub config_id: Option<ProxyConfigId>,
    pub egress: EgressConfig,
    pub ingress: IngressConfig,
    pub access_reason: Option<String>,
    pub global_fp_id: Option<FpId>,
}

#[derive(Debug, Clone)]
pub struct EgressConfig {
    pub url: Url,
    pub method: Method,
    pub headers: ForwardProxyHeaders,
    pub pinned_certs: PinnedServerCertificates,
    pub client_tls_credential: Option<ClientCertificateKey>,
}

#[derive(Debug, Clone)]
pub struct IngressConfig {
    pub content_type: IngressContentType,
    pub rules: Vec<IngressRule>,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum IngressContentType {
    Unspecified,
    Json,
}

impl From<ProxyIngressContentType> for IngressContentType {
    fn from(t: ProxyIngressContentType) -> Self {
        match t {
            ProxyIngressContentType::Json => Self::Json,
        }
    }
}

#[derive(Debug, Clone)]
pub struct JustInTimeProxyConfig {
    pub config: ProxyConfig,
}

impl paperclip::v2::schema::Apiv2Schema for JustInTimeProxyConfig {
    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        proxy_headers::schema()
    }
}

impl paperclip::actix::OperationModifier for JustInTimeProxyConfig {}
/// Parse a proxy config from the request by it's id or just-in-time specified headers
impl FromRequest for JustInTimeProxyConfig {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let proxy_config_from_headers = ProxyConfig::try_from(req.headers());

        Box::pin(async move {
            Ok(JustInTimeProxyConfig {
                config: proxy_config_from_headers?,
            })
        })
    }
}

/// Workaround: An empty struct to pass into the route for
/// defining that headers can be passed in optionally
#[derive(Debug, Clone)]
pub struct ProxyIdAdditonalHeaders;

impl paperclip::v2::schema::Apiv2Schema for ProxyIdAdditonalHeaders {
    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        proxy_headers::schema_opts(true)
    }
}

impl paperclip::actix::OperationModifier for ProxyIdAdditonalHeaders {}
/// Parse a proxy config from the request by it's id or just-in-time specified headers
impl FromRequest for ProxyIdAdditonalHeaders {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(_req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        Box::pin(async move { Ok(ProxyIdAdditonalHeaders) })
    }
}

impl TryFrom<&HeaderMap> for ProxyConfig {
    type Error = ApiError;

    /// Parses the intended Proxy configuration from the request
    fn try_from(headers: &HeaderMap) -> ApiResult<Self> {
        let access_reason = get_header(proxy_headers::ACCESS_REASON, headers);

        let proxy_target = get_required_header(proxy_headers::EGRESS_URL_HEADER_NAME, headers)?;
        let url = url::Url::parse(&proxy_target).map_err(|_| VaultProxyError::InvalidDestinationUrl)?;
        let method = get_proxy_method_or_default(headers, Method::POST);
        let global_fp_id = get_header(proxy_headers::USER_TOKEN_ASSIGNMENT_HEADER, headers).map(FpId::from);

        let egress_headers = ForwardProxyHeaders::try_from(headers)?;
        let pinned_certs = PinnedServerCertificates::try_from(headers)?;
        let client_certs = ParsedClientCertificate::try_from(headers)?;

        let egress = EgressConfig {
            url,
            method,
            headers: egress_headers,
            pinned_certs,
            // typically should avoid configuring client certs from headers
            client_tls_credential: client_certs.client_tls_credential,
        };

        let content_type = get_header(proxy_headers::INGRESS_CONTENT_TYPE, headers)
            .and_then(|typ| IngressContentType::from_str(&typ).ok())
            .unwrap_or(IngressContentType::Unspecified);

        let ingress_rules = ParsedIngressRules::try_from(headers)?.0;

        if !ingress_rules.is_empty() && content_type == IngressContentType::Unspecified {
            return Err(VaultProxyError::MissingIngressRuleContentType)?;
        }
        let ingress = IngressConfig {
            content_type,
            rules: ingress_rules,
        };

        Ok(Self {
            global_fp_id,
            config_id: None,
            egress,
            ingress,
            access_reason,
        })
    }
}

impl ProxyConfig {
    /// Load from a proxy database configuration
    /// Note: we also take a header map because some configurations
    /// require additional headers OR can be overwritten with header specifications
    pub async fn load_from_db(
        state: &State,
        auth: &dyn TenantAuth,
        proxy_id: ProxyConfigId,
        header_map: &HeaderMap,
    ) -> Result<Self, crate::ApiError> {
        let tenant_id = auth.tenant().id.clone();
        let is_live = auth.is_live()?;

        let (db_config, headers, secret_headers, server_certs, ingress_rules) = state
            .db_pool
            .db_query(move |conn| {
                db::models::proxy_config::ProxyConfig::find(conn, &tenant_id, is_live, proxy_id)
            })
            .await??;

        // do not allow using a disabled proxy configuration
        if db_config.status != ApiKeyStatus::Enabled {
            return Err(VaultProxyError::ProxyConfigDisabled)?;
        }

        let db::models::proxy_config::ProxyConfig {
            id,
            tenant_id: _,
            is_live: _,
            name: _,
            created_at: _,
            _created_at: _,
            _updated_at: _,
            url,
            method,
            client_identity_cert_der,
            e_client_identity_key_der,
            ingress_content_type,
            access_reason,
            status: _,
            deactivated_at: _,
        } = db_config;

        // get the base url and/or path and query from headers
        let url =
            if let Some(path_and_query) = get_header(proxy_headers::EGRESS_PATH_AND_QUERY, header_map) {
                let url = format!("{url}{path_and_query}");
                url::Url::parse(&url)
            } else {
                url::Url::parse(&url)
            }
            .map_err(|_| VaultProxyError::InvalidDestinationUrl)?;

        let method =
            reqwest::Method::from_str(&method).map_err(|_| VaultProxyError::InvalidDestinationMethod)?;

        // support method JIT overwrite
        let method = get_proxy_method_or_default(header_map, method);

        // grab a global fp_id
        // note we dont throw the error here as it may or may not be required
        let global_fp_id =
            get_header(proxy_headers::USER_TOKEN_ASSIGNMENT_HEADER, header_map).map(FpId::from);

        // build the headers
        let headers = headers
            .into_iter()
            .map(|header| (header.name, PiiString::from(header.value)))
            .chain({
                let secret_header_values = secret_headers
                    .iter()
                    .map(|sh| (sh.name.clone(), &sh.e_data, vec![]))
                    .collect();
                state
                    .enclave_client
                    .batch_decrypt_to_piistring(secret_header_values, &auth.tenant().e_private_key)
                    .await?
                    .into_iter()
            });

        // decrypt and parse the client tls creds if available
        let client_tls_credential = match (client_identity_cert_der, e_client_identity_key_der) {
            (Some(cert), Some(e_key)) => {
                // decrypt the sealed cert
                let key_der = state
                    .enclave_client
                    .decrypt_to_pii_bytes(&e_key, &auth.tenant().e_private_key, vec![])
                    .await?;

                // encode to pem and parse
                let key_pem = {
                    crypto::pem::encode(&crypto::pem::Pem {
                        tag: "PRIVATE KEY".into(),
                        contents: key_der.into_leak(),
                    })
                };

                let cert_pem = {
                    crypto::pem::encode(&crypto::pem::Pem {
                        tag: "CERTIFICATE".into(),
                        contents: cert,
                    })
                };

                Some(ClientCertificateKey::parse_cert_and_key(
                    cert_pem.as_bytes(),
                    key_pem.as_bytes(),
                )?)
            }
            _ => None,
        };

        // add server certs
        let pinned_certs = server_certs
            .into_iter()
            .map(|cert| {
                let cert_pem = {
                    crypto::pem::encode(&crypto::pem::Pem {
                        tag: "CERTIFICATE".into(),
                        contents: cert.cert_der,
                    })
                };

                reqwest::Certificate::from_pem(cert_pem.as_bytes())
                    .map_err(VaultProxyError::ServerPinCertificate)
            })
            .collect::<Result<Vec<_>, _>>()?;

        // ingress rules
        // NOTE: ingress rules defined in the config table need a matching `fp_id`
        let rules = IngressRule::parse_from_db_rules(ingress_rules, global_fp_id.clone())?;

        // support additional JIT forward headers
        let headers = ForwardProxyHeaders(headers.collect())
            .concat(ForwardProxyHeaders::try_from(header_map).ok().unwrap_or_default());

        Ok(ProxyConfig {
            global_fp_id,
            config_id: Some(id),
            egress: EgressConfig {
                url,
                method,
                headers,
                pinned_certs: PinnedServerCertificates { certs: pinned_certs },
                client_tls_credential,
            },
            ingress: IngressConfig {
                content_type: ingress_content_type
                    .map(IngressContentType::from)
                    .unwrap_or(IngressContentType::Unspecified),
                rules,
            },
            access_reason,
        })
    }
}

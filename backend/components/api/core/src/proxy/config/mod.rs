use self::certificates::ParsedClientCertificate;
use self::certificates::PinnedServerCertificates;
use self::fwd_headers::ForwardProxyHeaders;
use self::ingress_rule::IngressRule;
use self::ingress_rule::ParsedIngressRules;
use crate::api_headers_schema;
use crate::auth::tenant::TenantAuth;
use crate::enclave_client::DecryptReq;
use crate::errors::proxy::VaultProxyError;
use crate::FpResult;
use crate::State;
use actix_web::http::header::HeaderMap;
use api_errors::FpError;
use newtypes::ApiKeyStatus;
use newtypes::FpId;
use newtypes::PiiString;
use newtypes::ProxyConfigId;
use newtypes::ProxyIngressContentType;
use reqwest::Method;
use std::str::FromStr;
use strum::EnumString;
use url::Url;

mod certificates;
pub use self::certificates::ClientCertificateKey;

mod fwd_headers;
pub mod ingress_rule;

api_headers_schema! {
    pub struct JitProxyHeaderParams {
        required: {
            /// Target proxy destination URL.
            #[example="https://acmebankprocessor.com/api/process_transaction"]
            egress_url: url::Url = "x-fp-proxy-target-url";
        }
        optional: {}
    }
}
api_headers_schema! {
    pub struct ProxyHeaderParams {
        required: {}

        optional: {
            /// HTTP Method VERB for the proxy destination request (defaults to POST).
            egress_method: Method = "x-fp-proxy-method";

            /// Egress destination URL path and query string to append.
            egress_path_and_query: PiiString = "x-fp-path-and-query";

            /// Content-type for the proxy ingress.
            ingress_content_type: IngressContentType = "x-fp-proxy-ingress-content-type";

            /// Access reason for any egress decryption operations during the proxy request.
            access_reason: String = "x-fp-proxy-access-reason";

            /// When proxy requests are on behalf of a single footprint vault, you
            /// can omit the `fp_id_` prefix on token identifiers, and just use `id.x` or `custom.y` instead
            /// of `fp_id_xyz.id.x` or `fp_id_xyz.custom.y`.
            ///
            /// Similarly, if specifying proxy configuration ingress rules from a stored configuration
            /// the corresponding token must be assigned just-in-time via a headers.
            ///
            /// i.e: `x-fp-id: fp_id_abc`
            #[alias = "x-fp-proxy-footprint-token"]
            user_token_assignment: FpId = "x-fp-id";

            /// Configure one more ingress rules.
            ///
            /// x-fp-proxy-ingress-rule: fp_id_abc.custom.credit_card_number=$.data.card.number
            /// x-fp-proxy-ingress-rule: fp_id_abc.custom.credit_card_exp=$.data.card.expiration
            /// x-fp-proxy-ingress-rule: fp_id_abc.custom.credit_card_cvc=$.data.card.security_code
            ingress_rule: String = "x-fp-proxy-ingress-rule";

            /// Headers with this `x-fp-proxy-fwd-*` prefix are forwarded to the proxy egress, with the prefix stripped.
            /// For example `x-fp-proxy-fwd-MYHEADER: hello world` sends `MYHEADER: hello world` to the destination.
            forward_header_prefix: PiiString = "x-fp-proxy-fwd-";

            /// Base64 encoded PEM client certificate to use (required if using key).
            client_cert: String = "x-fp-proxy-client-cert";

            /// Base64 encoded PEM client key to use (required if using cert).
            client_key: PiiString = "x-fp-proxy-client-key";

            /// Configure one or more base64 encoded PEM server certificates to validate and pin
            /// proxy destination TLS connections.
            pin_cert: String = "x-fp-proxy-pin-cert";
        }
    }
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

#[derive(Debug, Clone, Copy, Eq, PartialEq, EnumString, Default)]
#[strum(serialize_all = "snake_case")]
pub enum IngressContentType {
    #[default]
    Unspecified,
    Json,
}

impl From<IngressContentType> for Option<mime::Mime> {
    fn from(value: IngressContentType) -> Self {
        match value {
            IngressContentType::Unspecified => None,
            IngressContentType::Json => Some(mime::APPLICATION_JSON),
        }
    }
}

impl From<ProxyIngressContentType> for IngressContentType {
    fn from(t: ProxyIngressContentType) -> Self {
        match t {
            ProxyIngressContentType::Json => Self::Json,
        }
    }
}

impl TryFrom<(JitProxyHeaderParams, ProxyHeaderParams, &HeaderMap)> for ProxyConfig {
    type Error = FpError;

    /// Parses the intended Proxy configuration from the request
    fn try_from(
        (jit_params, params, headers): (JitProxyHeaderParams, ProxyHeaderParams, &HeaderMap),
    ) -> FpResult<Self> {
        let egress_headers = ForwardProxyHeaders::try_from(headers)?;
        let pinned_certs = PinnedServerCertificates::try_from(headers)?;
        let client_certs = ParsedClientCertificate::try_from(&params)?;

        let egress: EgressConfig = EgressConfig {
            url: jit_params.egress_url,
            method: params.egress_method.unwrap_or(Method::POST),
            headers: egress_headers,
            pinned_certs,
            // typically should avoid configuring client certs from headers
            client_tls_credential: client_certs.client_tls_credential,
        };

        let content_type = params.ingress_content_type.unwrap_or_default();
        let ingress_rules = ParsedIngressRules::try_from(headers)?.0;

        if !ingress_rules.is_empty() && content_type == IngressContentType::Unspecified {
            return Err(VaultProxyError::MissingIngressRuleContentType)?;
        }
        let ingress = IngressConfig {
            content_type,
            rules: ingress_rules,
        };

        Ok(Self {
            global_fp_id: params.user_token_assignment.clone(),
            config_id: None,
            egress,
            ingress,
            access_reason: params.access_reason,
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
        params: ProxyHeaderParams,
        header_map: &HeaderMap,
    ) -> FpResult<Self> {
        let tenant_id = auth.tenant().id.clone();
        let is_live = auth.is_live()?;

        let (db_config, headers, secret_headers, server_certs, ingress_rules) = state
            .db_pool
            .db_query(move |conn| {
                db::models::proxy_config::ProxyConfig::find(conn, &tenant_id, is_live, proxy_id)
            })
            .await?;

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
        let url = if let Some(path_and_query) = params.egress_path_and_query {
            let url = format!("{url}{}", path_and_query.leak());
            url::Url::parse(&url)
        } else {
            url::Url::parse(&url)
        }
        .map_err(|_| VaultProxyError::InvalidDestinationUrl)?;

        let method =
            reqwest::Method::from_str(&method).map_err(|_| VaultProxyError::InvalidDestinationMethod)?;

        // support method JIT overwrite
        let method = params.egress_method.unwrap_or(method);

        // grab the global fp_id
        // note we dont throw the error here as it may or may not be required
        let global_fp_id = params.user_token_assignment;

        // build the headers
        let headers = headers
            .into_iter()
            .map(|header| (header.name, PiiString::from(header.value)))
            .chain({
                let secret_header_values = secret_headers
                    .iter()
                    .map(|sh| {
                        let req = DecryptReq(&auth.tenant().e_private_key, &sh.e_data, vec![]);
                        (sh.name.clone(), req)
                    })
                    .collect();
                state
                    .enclave_client
                    .batch_decrypt_to_piistring(secret_header_values)
                    .await?
                    .into_iter()
            });

        // decrypt and parse the client tls creds if available
        let client_tls_credential = match (client_identity_cert_der, e_client_identity_key_der) {
            (Some(cert), Some(e_key)) => {
                // decrypt the sealed cert
                let key_der = state
                    .enclave_client
                    .decrypt_to_pii_bytes(&e_key, &auth.tenant().e_private_key)
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
                    .unwrap_or_default(),
                rules,
            },
            access_reason,
        })
    }
}

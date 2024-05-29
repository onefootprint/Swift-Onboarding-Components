use crate::utils::db2api::DbToApi;
use api_wire_types::{
    OmittedSecretCustomHeader,
    PlainCustomHeader,
    ProxyIngressRule,
};
use db::models::proxy_config::{
    DbProxyConfigAll,
    ProxyConfig,
};
use newtypes::DataIdentifier;
use std::str::FromStr;

impl DbToApi<ProxyConfig> for api_wire_types::ProxyConfigBasic {
    fn from_db(config: ProxyConfig) -> Self {
        let ProxyConfig {
            id,
            tenant_id: _,
            is_live,
            name,
            created_at,
            _created_at,
            _updated_at,
            url,
            method,
            client_identity_cert_der: _,
            e_client_identity_key_der: _,
            ingress_content_type: _,
            access_reason: _,
            status,
            deactivated_at,
        } = config;

        api_wire_types::ProxyConfigBasic {
            id,
            is_live,
            name,
            created_at,
            url,
            method,
            status,
            deactivated_at,
        }
    }
}

impl DbToApi<DbProxyConfigAll> for api_wire_types::ProxyConfigDetailed {
    fn from_db((config, headers, secret_headers, server_certs, ingress_rules): DbProxyConfigAll) -> Self {
        let ProxyConfig {
            id,
            tenant_id: _,
            is_live,
            name,
            created_at,
            _created_at,
            _updated_at,
            url,
            method,
            client_identity_cert_der,
            e_client_identity_key_der: _,
            ingress_content_type,
            access_reason,
            status,
            deactivated_at,
        } = config;

        let client_certificate = client_identity_cert_der.map(der_to_pem);

        api_wire_types::ProxyConfigDetailed {
            id,
            is_live,
            name,
            created_at,
            url,
            method,
            client_certificate,
            ingress_content_type,
            access_reason,
            status,
            deactivated_at,
            headers: headers
                .into_iter()
                .map(|header| PlainCustomHeader {
                    name: header.name,
                    value: header.value,
                })
                .collect(),
            secret_headers: secret_headers
                .into_iter()
                .map(|header| OmittedSecretCustomHeader {
                    id: header.id,
                    name: header.name,
                })
                .collect(),
            pinned_server_certificates: server_certs
                .into_iter()
                .map(|cert| der_to_pem(cert.cert_der))
                .collect(),
            ingress_rules: ingress_rules
                .into_iter()
                .flat_map(|rule| {
                    DataIdentifier::from_str(&rule.token_path)
                        .ok()
                        .map(|token| (token, rule.target))
                })
                .map(|(token, target)| ProxyIngressRule { token, target })
                .collect(),
        }
    }
}

fn der_to_pem(cert: Vec<u8>) -> String {
    crypto::pem::encode(&crypto::pem::Pem {
        tag: "CERTIFICATE".into(),
        contents: cert,
    })
}

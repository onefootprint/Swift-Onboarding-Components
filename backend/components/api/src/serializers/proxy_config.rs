use crate::utils::db2api::DbToApi;
use db::models::proxy_config::ProxyConfig;

impl DbToApi<ProxyConfig> for api_wire_types::ProxyConfig {
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
            client_identity_cert_der,
            e_client_identity_key_der: _,
            ingress_content_type,
            access_reason,
        } = config;

        let client_certificate = client_identity_cert_der.map(der_to_pem);

        api_wire_types::ProxyConfig {
            id,
            is_live,
            name,
            created_at,
            url,
            method,
            client_certificate,
            ingress_content_type,
            access_reason,
        }
    }
}

fn der_to_pem(cert: Vec<u8>) -> String {
    crypto::pem::encode(&crypto::pem::Pem {
        tag: "CERTIFICATE".into(),
        contents: cert,
    })
}

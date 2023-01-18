use super::config::EgressConfig;
use crate::errors::proxy::VaultProxyError;

use newtypes::PiiString;

pub async fn proxy_request(
    body: PiiString,
    config: EgressConfig,
) -> Result<reqwest::Response, VaultProxyError> {
    let mut client = reqwest::Client::builder().use_rustls_tls();

    if let Some(client_tls) = config.client_tls_credential {
        client = client.identity(client_tls.into_identity())
    }

    if !config.pinned_certs.certs.is_empty() {
        client = client.tls_built_in_root_certs(false);
    }

    for cert in config.pinned_certs.certs {
        client = client.add_root_certificate(cert);
    }

    let client = client.build()?;
    let request = client
        .request(config.method, config.url)
        .headers(config.headers.try_into_headers()?)
        .body(body)
        .build()?;

    let response = client.execute(request).await?;
    Ok(response)
}

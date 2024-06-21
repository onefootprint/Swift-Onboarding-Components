use super::ProxyHeaderParams;
use crate::errors::proxy::VaultProxyError;
use crate::errors::ApiError;
use crate::FpResult;
use actix_web::http::header::HeaderMap;
use std::fmt::Debug;

/// Client certificate authentication to use for the upstream proxy
#[derive(Clone)]
pub struct ClientCertificateKey {
    identity: reqwest::Identity,
}

impl Debug for ClientCertificateKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted client cert and key>")
    }
}

impl ClientCertificateKey {
    pub fn into_identity(self) -> reqwest::Identity {
        self.identity
    }

    /// parses PEM encoded X509 cert chain + pkcs8 PEM private key
    pub fn parse_cert_and_key(cert: &[u8], key: &[u8]) -> Result<ClientCertificateKey, VaultProxyError> {
        let cert_and_key = [cert, &[b'\n'], key].concat();

        let identity =
            reqwest::Identity::from_pem(&cert_and_key).map_err(VaultProxyError::ClientIdentityCertificate)?;
        Ok(ClientCertificateKey { identity })
    }
}

/// Configure client tls auth via header params
/// Note: want to avoid transmitting private keys over the wire
/// but we still _support_ this proxy config method
#[derive(Debug, Clone)]
pub struct ParsedClientCertificate {
    pub client_tls_credential: Option<ClientCertificateKey>,
}

impl TryFrom<&ProxyHeaderParams> for ParsedClientCertificate {
    type Error = ApiError;

    fn try_from(params: &ProxyHeaderParams) -> FpResult<Self> {
        let cert = params.client_cert.clone();
        let key = params.client_key.clone();

        match (cert, key) {
            (Some(cert), Some(key)) => {
                let cert = urlencoding::decode(&cert).map_err(|_| VaultProxyError::InvalidPemUrlEncoding)?;
                let key =
                    urlencoding::decode(key.leak()).map_err(|_| VaultProxyError::InvalidPemUrlEncoding)?;

                Ok(ParsedClientCertificate {
                    client_tls_credential: Some(ClientCertificateKey::parse_cert_and_key(
                        cert.as_bytes(),
                        key.as_bytes(),
                    )?),
                })
            }
            (Some(_), None) | (None, Some(_)) => Err(VaultProxyError::InvalidClientCertHeader)?,
            (None, None) => Ok(ParsedClientCertificate {
                client_tls_credential: None,
            }),
        }
    }
}

/// Pin destination certificate public keys
#[derive(Debug, Clone)]
pub struct PinnedServerCertificates {
    pub certs: Vec<reqwest::Certificate>,
}

impl TryFrom<&HeaderMap> for PinnedServerCertificates {
    type Error = VaultProxyError;

    fn try_from(headers: &HeaderMap) -> Result<Self, VaultProxyError> {
        let certs = ProxyHeaderParams::raw_get_all_pin_cert(headers)
            .into_iter()
            .map(|value| -> Result<_, VaultProxyError> {
                let value = value
                    .to_str()
                    .map_err(|_| VaultProxyError::InvalidPinCertHeader)?;

                // support HTTP1.1 where multi-header values are CSV
                let values: Vec<_> = value
                    .split(',')
                    .map(|value_split| {
                        let value = urlencoding::decode(value_split)
                            .map_err(|_| VaultProxyError::InvalidPemUrlEncoding)?;

                        reqwest::Certificate::from_pem(value.as_bytes())
                            .map_err(VaultProxyError::ServerPinCertificate)
                    })
                    .collect::<Result<Vec<_>, VaultProxyError>>()?;
                Ok(values)
            })
            .collect::<Result<Vec<_>, VaultProxyError>>()?
            .into_iter()
            .flatten()
            .collect();

        Ok(Self { certs })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_parse_identity() {
        let cert = include_str!("../../../../../../external_tools/ditto/src/dummy_cert/client.crt");
        let key = include_str!("../../../../../../external_tools/ditto/src/dummy_cert/client.key");
        let server_cert = include_str!("../../../../../../external_tools/ditto/src/dummy_cert/server.crt");

        let cert_and_key = ClientCertificateKey::parse_cert_and_key(cert.as_bytes(), key.as_bytes())
            .expect("cert and key parsing");

        let server_cert = reqwest::Certificate::from_pem(server_cert.as_bytes()).expect("server cert");

        let _client = reqwest::Client::builder()
            .tls_built_in_root_certs(false)
            .use_rustls_tls()
            .add_root_certificate(server_cert)
            .identity(cert_and_key.identity)
            .build()
            .expect("build client");

        // let get = client
        //     .get("https://ditto.footprint.dev:8443")
        //     .build()
        //     .expect("request build");
        // let _ = client.execute(get).await.expect("get failed");
    }
}

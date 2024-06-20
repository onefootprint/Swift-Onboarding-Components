use crate::constants::APPLE_APP_ATTESTATION_ROOT_CA_PEM;
use crate::constants::APPLE_PUBLIC_ROOT_CERT_PEM;
use crate::error::AttestationError;
use openssl::x509::X509;
pub mod attestation;
pub mod device_check;

#[cfg(test)]
mod tests;

#[derive(Debug, Clone)]
pub struct AppleAppAttestationVerifier {
    config: Config,
}

#[derive(Debug, Clone)]
struct Config {
    allowed_app_bundle_ids: Vec<String>,
    root_ca_list: Vec<X509>,
    team_id: String,
    private_key_pem: String,
    key_id: String,
}

impl AppleAppAttestationVerifier {
    /// create a new verifier with default CAs
    pub fn new_default_ca<S>(
        allowed_app_bundle_ids: Vec<S>,
        private_key_pem: &str,
        key_id: &str,
        team_id: &str,
    ) -> Result<Self, AttestationError>
    where
        S: Into<String>,
    {
        Self::new(
            allowed_app_bundle_ids,
            vec![APPLE_APP_ATTESTATION_ROOT_CA_PEM, APPLE_PUBLIC_ROOT_CERT_PEM],
            private_key_pem,
            key_id,
            team_id,
        )
    }

    /// create a new verifier with customizable CAs
    pub fn new<S>(
        allowed_app_bundle_ids: Vec<S>,
        root_ca_list: Vec<&[u8]>,
        private_key_pem: &str,
        key_id: &str,
        team_id: &str,
    ) -> Result<Self, AttestationError>
    where
        S: Into<String>,
    {
        let ids = allowed_app_bundle_ids.into_iter().map(|s| s.into()).collect();
        let cas = root_ca_list
            .iter()
            .map(|c| X509::from_pem(c))
            .collect::<Result<Vec<X509>, _>>()?;

        Ok(Self {
            config: Config {
                allowed_app_bundle_ids: ids,
                root_ca_list: cas,
                key_id: key_id.into(),
                team_id: team_id.into(),
                private_key_pem: private_key_pem.into(),
            },
        })
    }
}

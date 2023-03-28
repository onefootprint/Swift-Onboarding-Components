use async_trait::async_trait;

use crate::{Fingerprint, PiiString};

/// a trait to help normalize data input to our signed hash
pub trait SaltedFingerprint: std::marker::Send {
    fn salt_pii_to_sign(&self, data: &PiiString) -> [u8; 32];
}

/// Signed hasher interface
#[async_trait]
pub trait Fingerprinter: std::marker::Sync {
    type Error;
    async fn sign_data(&self, data: &[u8]) -> Result<Fingerprint, Self::Error>;

    async fn compute_fingerprint(
        &self,
        salt: impl SaltedFingerprint,
        // TODO this should be able to take in &PiiString
        data: PiiString,
    ) -> Result<Fingerprint, Self::Error> {
        let data_to_sign = salt.salt_pii_to_sign(&data);
        self.sign_data(&data_to_sign).await
    }
}

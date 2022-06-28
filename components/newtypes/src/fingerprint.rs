use async_trait::async_trait;

use crate::Fingerprint;

/// a trait to help normalize data input to our signed hash
pub trait SaltedFingerprint {
    fn salt_data_to_sign(&self, data: &[u8]) -> [u8; 32];
}

/// Signed hasher interface
#[async_trait]
pub trait Fingerprinter {
    type Error;
    async fn sign_data(&self, data: &[u8]) -> Result<Fingerprint, Self::Error>;

    async fn compute_fingerprint<S: SaltedFingerprint + Send>(
        &self,
        salt: S,
        data: &str,
    ) -> Result<Fingerprint, Self::Error> {
        self.compute_fingerprint_bytes(salt, data.as_bytes()).await
    }

    async fn compute_fingerprint_bytes<S: SaltedFingerprint + Send>(
        &self,
        salt: S,
        data: &[u8],
    ) -> Result<Fingerprint, Self::Error> {
        let data_to_sign = salt.salt_data_to_sign(data);
        self.sign_data(&data_to_sign).await
    }
}

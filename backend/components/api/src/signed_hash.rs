use async_trait::async_trait;
use aws_sdk_kms::types::Blob;
use crypto::sha256;
use newtypes::{Fingerprint, Fingerprinter};

use crate::{errors::kms::KmsSignError, State};

#[derive(Debug, Clone)]
pub struct SignedHashClient {
    pub client: aws_sdk_kms::Client,
    pub key_id: String,
}

impl SignedHashClient {
    #[allow(dead_code)]
    #[tracing::instrument(skip_all)]
    pub async fn verify_mac(&self, data: &[u8], signature: &[u8]) -> Result<bool, KmsSignError> {
        let result = self
            .client
            .verify_mac()
            .key_id(&self.key_id)
            .mac_algorithm(aws_sdk_kms::model::MacAlgorithmSpec::HmacSha512)
            .message(Blob::new(data))
            .mac(Blob::new(signature))
            .send()
            .await?;

        Ok(result.mac_valid())
    }

    #[tracing::instrument(skip_all)]
    pub async fn signed_hash(&self, data: &[u8]) -> Result<Vec<u8>, KmsSignError> {
        // hash the data before sending it to aws
        let data = sha256(data).to_vec();

        let result = self
            .client
            .generate_mac()
            .mac_algorithm(aws_sdk_kms::model::MacAlgorithmSpec::HmacSha512)
            .key_id(&self.key_id)
            .message(Blob::new(data))
            .send()
            .await?;

        Ok(result
            .mac()
            .ok_or(KmsSignError::MacDataNotReturned)?
            .as_ref()
            .to_vec())
    }
}

#[async_trait]
impl Fingerprinter for SignedHashClient {
    type Error = KmsSignError;

    #[tracing::instrument(skip_all)]
    async fn sign_data(&self, data: &[u8]) -> Result<Fingerprint, Self::Error> {
        Ok(Fingerprint(self.signed_hash(data).await?))
    }
}

#[async_trait]
impl Fingerprinter for State {
    type Error = KmsSignError;

    #[tracing::instrument(skip_all)]
    async fn sign_data(&self, data: &[u8]) -> Result<Fingerprint, Self::Error> {
        self.hmac_client.sign_data(data).await
    }
}

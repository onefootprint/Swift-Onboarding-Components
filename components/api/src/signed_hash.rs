use aws_sdk_kms::types::Blob;
use crypto::sha256;

use crate::errors::ApiError;

#[derive(Debug, Clone)]
pub struct SignedHashClient {
    pub client: aws_sdk_kms::Client,
    pub key_id: String,
}

impl SignedHashClient {
    #[allow(dead_code)]
    pub async fn verify_mac(&self, data: &[u8], signature: &[u8]) -> Result<bool, ApiError> {
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

    pub async fn signed_hash(&self, data: &[u8]) -> Result<Vec<u8>, ApiError> {
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

        Ok(result.mac().unwrap().as_ref().to_vec())
    }
}

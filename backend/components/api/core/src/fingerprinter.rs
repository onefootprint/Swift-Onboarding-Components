use async_trait::async_trait;
use aws_sdk_kms::types::Blob;
use crypto::sha256;
use db::models::vault::Vault;
use futures::future::try_join_all;
use newtypes::{
    fingerprinter::{FingerprintScopable, Fingerprinter, GlobalFingerprintKind},
    secret_api_key::ApiKeyFingerprinter,
    DataIdentifier, Fingerprint, PiiString,
};

use crate::{errors::kms::KmsSignError, ApiError, State};

/// Deprecated: old signed hash method using KMS directly
/// replaced by hmac signing in the enclave
/// we need to keep this around in order support older fingerprints in the db until we migrate
#[derive(Debug, Clone)]
pub struct AwsHmacClient {
    pub client: aws_sdk_kms::Client,
    pub key_id: String,
}

impl AwsHmacClient {
    #[allow(unused)]
    #[tracing::instrument(skip_all)]
    async fn verify_mac(&self, data: &[u8], signature: &[u8]) -> Result<bool, KmsSignError> {
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

impl AwsHmacClient {
    #[tracing::instrument(skip_all)]
    pub async fn compute_fingerprint(
        &self,
        id: DataIdentifier,
        data: &PiiString,
    ) -> Result<Fingerprint, KmsSignError> {
        let data = data.clean_for_fingerprint();
        let data_to_sign = id.legacy_salt_pii_to_sign(&data);
        Ok(Fingerprint(self.signed_hash(&data_to_sign).await?))
    }
}

#[async_trait]
impl ApiKeyFingerprinter for State {
    type Error = ApiError;

    async fn sign_raw_data(&self, data: &[u8]) -> Result<Fingerprint, Self::Error> {
        Ok(Fingerprint(self.aws_hmac_client.signed_hash(data).await?))
    }
}

#[async_trait]
impl Fingerprinter for State {
    type Error = crate::ApiError;

    async fn compute_fingerprints<S: FingerprintScopable + Send + Sync>(
        &self,
        data: &[(S, &PiiString)],
    ) -> Result<Vec<Fingerprint>, Self::Error> {
        Ok(self.enclave_client.batch_fingerprint(data).await?)
    }

    async fn legacy_compute_fingerprints(
        &self,
        data: &[(DataIdentifier, &PiiString)],
    ) -> Result<Vec<Fingerprint>, Self::Error> {
        Ok(try_join_all(
            data.iter()
                .map(|(id, pii)| self.aws_hmac_client.compute_fingerprint(id.to_owned(), pii)),
        )
        .await?)
    }
}

impl State {
    /// This is a helper function for finding portable vault
    /// by using fingerprinted data
    /// Currently it fallbacks to legacy fingerprints if lookup fails (we can simplify once we migrate)
    #[tracing::instrument(skip(self))]
    pub async fn find_portable_vault_by_fingerprint(
        &self,
        kind: GlobalFingerprintKind,
        data: &PiiString,
    ) -> Result<Option<Vault>, ApiError> {
        let sh_data = self.compute_fingerprint(kind, data).await?;

        let existing_user = self
            .db_pool
            .db_query(|conn| Vault::find_portable(conn, &[sh_data]))
            .await??;

        // Legacy fingerprint support (todo: remove once migration complete)
        let existing_user = if existing_user.is_none() {
            let sh_data = self
                .compute_legacy_fingerprint(kind.data_identifier(), data)
                .await?;

            self.db_pool
                .db_query(|conn| Vault::find_portable(conn, &[sh_data]))
                .await??
        } else {
            existing_user
        };
        Ok(existing_user)
    }
}

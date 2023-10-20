use api_wire_types::IdentifyId;
use async_trait::async_trait;
use aws_sdk_kms::primitives::Blob;
use crypto::sha256;
use db::models::vault::Vault;
use itertools::Itertools;
use newtypes::{
    fingerprinter::{FingerprintScopable, FingerprintScope, Fingerprinter, GlobalFingerprintKind},
    secret_api_key::ApiKeyFingerprinter,
    DataIdentifier, Fingerprint, IdentityDataKind as IDK, PiiString, TenantId,
};

use crate::{errors::kms::KmsSignError, ApiError, State};
use newtypes::SandboxId;

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
            .mac_algorithm(aws_sdk_kms::types::MacAlgorithmSpec::HmacSha512)
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
            .mac_algorithm(aws_sdk_kms::types::MacAlgorithmSpec::HmacSha512)
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
impl ApiKeyFingerprinter for State {
    type Error = ApiError;

    async fn sign_raw_data(&self, data: &[u8]) -> Result<Fingerprint, Self::Error> {
        Ok(Fingerprint(self.aws_hmac_client.signed_hash(data).await?))
    }
}

#[async_trait]
impl Fingerprinter for State {
    type Error = crate::ApiError;

    async fn compute_fingerprints<T: Send, S: FingerprintScopable + Send + Sync>(
        &self,
        data: Vec<(T, S, &PiiString)>,
    ) -> Result<Vec<(T, Fingerprint)>, Self::Error> {
        let (identifiers, values_to_fp): (Vec<_>, Vec<_>) =
            data.into_iter().map(|(id, s, v)| (id, (s, v))).unzip();
        let fps = self.enclave_client.batch_fingerprint(&values_to_fp).await?;
        let results = identifiers.into_iter().zip(fps).collect();
        Ok(results)
    }
}

impl State {
    /// This is a helper function for finding vaults by using fingerprinted data.
    /// If t_id is provided, we will also look up users by tenant-scoped fingerprints.
    #[tracing::instrument(skip(self))]
    pub async fn find_vault(
        &self,
        id: IdentifyId,
        sandbox_id: Option<SandboxId>,
        t_id: Option<&TenantId>,
    ) -> Result<Option<Vault>, ApiError> {
        // Search via fingerprint
        let (scopes, data) = match id {
            IdentifyId::PhoneNumber(phone_number) => (
                vec![
                    Some(GlobalFingerprintKind::PhoneNumber.scope()),
                    t_id.map(|id| FingerprintScope::Tenant(&DataIdentifier::Id(IDK::PhoneNumber), id)),
                ],
                phone_number.e164(),
            ),
            IdentifyId::Email(email) => (
                vec![
                    Some(GlobalFingerprintKind::Email.scope()),
                    t_id.map(|id| FingerprintScope::Tenant(&DataIdentifier::Id(IDK::Email), id)),
                ],
                email.email,
            ),
        };
        // For now, default to the sandbox id provided inline in the phone or email,
        // otherwise, default to the one provided via a header
        let fps: Vec<_> = scopes
            .into_iter()
            .flatten()
            .zip(std::iter::repeat(&data))
            .map(|(s, v)| ((), s, v))
            .collect();
        let sh_datas = self
            .compute_fingerprints(fps)
            .await?
            .into_iter()
            .map(|(_, fp)| fp)
            .collect_vec();
        let existing_user = self
            .db_pool
            .db_query(move |conn| Vault::find_portable(conn, &sh_datas, sandbox_id))
            .await??;

        Ok(existing_user)
    }
}

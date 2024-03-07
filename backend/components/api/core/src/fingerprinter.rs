use api_wire_types::IdentifyId;
use async_trait::async_trait;
use aws_sdk_kms::primitives::Blob;
use crypto::sha256;
use db::{
    errors::OptionalExtension,
    models::{
        scoped_vault::ScopedVault,
        vault::{LocatedVault, Vault},
    },
};
use itertools::Itertools;
use newtypes::{
    fingerprinter::{FingerprintScopable, FingerprintScope, Fingerprinter, GlobalFingerprintKind},
    secret_api_key::ApiKeyFingerprinter,
    Fingerprint, IdentityDataKind as IDK, PiiString, ScopedVaultId, TenantId,
};

use crate::{
    enclave_client::EnclaveClient,
    errors::{kms::KmsSignError, ApiResult},
    ApiError, State,
};
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
impl Fingerprinter for EnclaveClient {
    type Error = crate::ApiError;

    async fn compute_fingerprints<T: Send, S: FingerprintScopable + Send + Sync>(
        &self,
        data: Vec<(T, S, &PiiString)>,
    ) -> Result<Vec<(T, Fingerprint)>, Self::Error> {
        let (identifiers, values_to_fp): (Vec<_>, Vec<_>) =
            data.into_iter().map(|(id, s, v)| (id, (s, v))).unzip();
        let fps = self.batch_fingerprint(&values_to_fp).await?;
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
        ids: Vec<IdentifyId>,
        sandbox_id: Option<SandboxId>,
        t_id: Option<&TenantId>,
    ) -> ApiResult<Option<(LocatedVault, Option<ScopedVaultId>)>> {
        // Search via fingerprint
        let fps = ids
            .into_iter()
            .map(|id| match id {
                IdentifyId::PhoneNumber(phone_number) => (
                    IDK::PhoneNumber.into(),
                    GlobalFingerprintKind::PhoneNumber,
                    phone_number.e164(),
                ),
                IdentifyId::Email(email) => (IDK::Email.into(), GlobalFingerprintKind::Email, email.email),
            })
            .collect_vec();
        let fps = fps
            .iter()
            .flat_map(|(di, gfk, pii)| {
                let scopes = vec![
                    Some(gfk.scope()),
                    t_id.map(|t_id| FingerprintScope::Tenant(di, t_id)),
                ];
                scopes.into_iter().flatten().map(move |scope| ((), scope, pii))
            })
            .collect_vec();
        let sh_datas = self
            .enclave_client
            .compute_fingerprints(fps)
            .await?
            .into_iter()
            .map(|(_, fp)| fp)
            .collect_vec();
        let t_id = t_id.cloned();
        let result = self
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let existing = Vault::find_portable(conn, &sh_datas, sandbox_id, t_id.as_ref())?;
                let Some(existing) = existing else {
                    return Ok(None);
                };
                let sv_id = t_id
                    .as_ref()
                    .map(|t_id| ScopedVault::get(conn, (&existing.vault.id, t_id)).optional())
                    .transpose()?
                    .flatten()
                    .map(|sv| sv.id);
                Ok(Some((existing, sv_id)))
            })
            .await?;

        Ok(result)
    }
}

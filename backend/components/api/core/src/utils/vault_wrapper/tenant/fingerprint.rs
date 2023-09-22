use db::{
    models::{fingerprint::NewFingerprint, ob_configuration::ObConfiguration},
    VaultedData,
};
use itertools::Itertools;
use newtypes::{FingerprintScopeKind, FingerprintVersion};

use crate::{errors::ApiResult, State};

use super::TenantVw;

impl<Type> TenantVw<Type> {
    /// This creates fingerprints scoped to the tenant for data
    /// that the tenant has access to
    pub async fn create_authorized_fingerprints(
        self,
        state: &State,
        ob_config: ObConfiguration,
    ) -> ApiResult<()> {
        let tenant_id = &ob_config.tenant_id;
        let accessible = ob_config
            .can_access_data
            .into_iter()
            .map(|cdo| cdo.data_identifiers().unwrap_or_default())
            .concat();

        let (data_lifetime_kinds_and_ids, sealed_data_to_fingerprint): (Vec<_>, Vec<_>) = accessible
            .iter()
            .filter(|di| di.is_fingerprintable())
            .filter_map(|id| {
                self.uvw
                    .get(id.clone())
                    .and_then(|ed| -> Option<_> {
                        let VaultedData::Sealed(data, _) = ed.data() else {
                            return None
                        };
                        Some((ed.lifetime_id(), data))
                    })
                    .map(|(dl_id, e_data)| ((id, dl_id), ((id, tenant_id), e_data)))
            })
            .unzip();

        let fingerprints = state
            .enclave_client
            .batch_fingerprint_sealed(&self.uvw.vault.e_private_key, sealed_data_to_fingerprint)
            .await?;

        let fingerprints = data_lifetime_kinds_and_ids.into_iter().zip(fingerprints);

        let fingerprints = fingerprints
            .into_iter()
            .map(|((kind, lifetime_id), sh_data)| NewFingerprint {
                kind: kind.clone(),
                sh_data,
                lifetime_id: lifetime_id.to_owned(),
                is_unique: false,
                scope: FingerprintScopeKind::Tenant,
                version: FingerprintVersion::V1,
            })
            .collect::<Vec<_>>();

        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                db::models::fingerprint::Fingerprint::bulk_create(conn, fingerprints)?;
                Ok(())
            })
            .await?;

        Ok(())
    }
}

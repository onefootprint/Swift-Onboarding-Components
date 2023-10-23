use std::collections::HashSet;

use db::{
    models::{
        fingerprint::{Fingerprint, NewFingerprint},
        ob_configuration::ObConfiguration,
    },
    VaultedData,
};
use itertools::Itertools;
use newtypes::{
    fingerprinter::{FingerprintScopable, FingerprintScope, GlobalFingerprintKind},
    FingerprintVersion, IdentityDataKind as IDK, PhoneNumber,
};

use crate::{errors::ApiResult, State};

use super::TenantVw;

impl<Type> TenantVw<Type> {
    /// Write new fingerprints as needed
    /// - Tenant-scoped fingerprints for data visible to the tenant
    /// - Globally-scoped fingerprints for newly portablized data
    /// Note: this is prone to race conditions. In the future, we should fingerprint all data
    /// required and then when we portablize data, save the fingerprints that don't yet exist
    pub async fn create_authorized_fingerprints(
        self,
        state: &State,
        ob_config: ObConfiguration,
    ) -> ApiResult<()> {
        let tenant_id = &ob_config.tenant_id;

        // Create tenant-scoped fingerprints for all data that's visible to the tenant
        let tenant_scoped_fps = ob_config
            .can_access_data
            .into_iter()
            .flat_map(|cdo| cdo.data_identifiers().unwrap_or_default())
            .filter(|di| di.is_fingerprintable())
            .collect_vec();
        let tenant_scoped_fps = tenant_scoped_fps.iter().filter_map(|di| -> Option<_> {
            let ed = self.uvw.get(di.clone())?;
            let VaultedData::Sealed(e_data, _) = ed.data() else {
                return None;
            };
            let lifetime_id = ed.lifetime_id();
            let scope = FingerprintScope::Tenant(di, tenant_id);
            Some(((di.clone(), lifetime_id, scope.kind()), (scope, e_data)))
        });

        // Create globally-scoped fingerprints for all globally-fingerprintable data that was collected
        let phone_number = self
            .decrypt_unchecked_single(&state.enclave_client, IDK::PhoneNumber.into())
            .await?;
        let is_fixture = phone_number
            .and_then(|p| PhoneNumber::parse(p).ok())
            .is_some_and(|p| p.is_fixture_phone_number());
        let global_scope_fps = if !is_fixture {
            ob_config
                .must_collect_data
                .into_iter()
                .flat_map(|cdo| cdo.data_identifiers().unwrap_or_default())
                .filter_map(|di| GlobalFingerprintKind::try_from(di).ok())
                .collect_vec()
        } else {
            // No global fingerprints for the fixture phone number
            vec![]
        };
        let global_scope_fps = global_scope_fps.iter().filter_map(|fpk| -> Option<_> {
            let di = fpk.data_identifier();
            let ed = self.uvw.get(di.clone())?;
            let VaultedData::Sealed(e_data, _) = ed.data() else {
                return None;
            };
            let scope = fpk.scope();
            let lifetime_id = ed.lifetime_id();
            Some(((di, lifetime_id, scope.kind()), (scope, e_data)))
        });

        let data_to_fp = tenant_scoped_fps
            .into_iter()
            .chain(global_scope_fps.into_iter())
            .collect_vec();

        // Filter out fingerprints that already exist
        let l_ids = data_to_fp.iter().map(|((_, id, _), _)| (*id).clone()).collect();
        let existing_fps = state
            .db_pool
            .db_query(move |conn| Fingerprint::bulk_get(conn, l_ids))
            .await??;
        let existing_fps = existing_fps
            .iter()
            .map(|fp| (fp.kind.clone(), &fp.lifetime_id, fp.scope))
            .collect::<HashSet<_>>();
        let data_to_fp = data_to_fp.into_iter().filter(|(k, _)| !existing_fps.contains(k));

        // Get the new fingerprints from the enclave
        let (keys, e_data): (Vec<_>, Vec<_>) = data_to_fp.unzip();
        let fingerprints = state
            .enclave_client
            .batch_fingerprint_sealed(&self.uvw.vault.e_private_key, e_data)
            .await?;

        let fingerprints = keys.into_iter().zip(fingerprints);
        let fingerprints = fingerprints
            .into_iter()
            .map(|((kind, lifetime_id, scope), sh_data)| NewFingerprint {
                kind,
                sh_data,
                lifetime_id: lifetime_id.to_owned(),
                // TODO phone should be unique, but if we enforce it here, saving these
                // fingerprints could fail
                is_unique: false,
                scope,
                version: FingerprintVersion::current(),
            })
            .collect::<Vec<_>>();
        state
            .db_pool
            .db_transaction(move |conn| Fingerprint::bulk_create(conn, fingerprints))
            .await?;

        Ok(())
    }
}

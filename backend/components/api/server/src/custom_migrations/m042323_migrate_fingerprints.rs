//! Migrates our old style fingerprints to the new algorithm, re-fingerprinting sealed data

use super::CustomMigration;
use api_core::enclave_client::EnclaveClient;
use api_core::errors::ApiResult;
use api_core::State;
use db::models::fingerprint::NewFingerprint;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
use db::{
    DbError,
    TxnPgConn,
};
use db_schema::schema::{
    data_lifetime,
    fingerprint,
    scoped_vault,
    tenant,
    vault,
    vault_data,
};
use diesel::dsl::not;
use diesel::prelude::*;
use futures::future::try_join_all;
use itertools::Itertools;
use newtypes::fingerprinter::GlobalFingerprintKind;
use newtypes::{
    DataIdentifier,
    FingerprintScopeKind,
    ScopedVaultId,
    TenantId,
};
use std::collections::HashMap;
use tokio::runtime::Handle;

pub struct Migration;

impl std::fmt::Debug for Migration {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!("CustomMigration({})", Self::version()).fmt(f)
    }
}

#[derive(Debug)]
/// Objects that migrations need to execute
pub struct MigrationState {
    enclave_client: EnclaveClient,
}
impl From<State> for MigrationState {
    fn from(value: State) -> Self {
        Self {
            enclave_client: value.enclave_client,
        }
    }
}

type MigrateDataMap = HashMap<ScopedVaultId, (Vault, TenantId, Vec<VaultData>)>;

impl CustomMigration for Migration {
    type MigrationState = MigrationState;

    fn version() -> String {
        "042323".into()
    }

    fn run(self, state: MigrationState, conn: &mut TxnPgConn) -> ApiResult<()> {
        // 1. first get the vaults and vault data to migrate
        let results: Vec<(ScopedVaultId, Vault, TenantId, VaultData)> = scoped_vault::table
            .inner_join(vault::table)
            .inner_join(data_lifetime::table)
            .inner_join(fingerprint::table.on(fingerprint::lifetime_id.eq(data_lifetime::id)))
            .inner_join(vault_data::table.on(vault_data::lifetime_id.eq(fingerprint::lifetime_id)))
            .inner_join(tenant::table)
            .filter(fingerprint::version.eq("v0"))
            .filter(not(tenant::id.ilike("_private_it%")))
            .filter(fingerprint::kind.eq_any(DataIdentifier::fingerprintable()))
            .select((
                scoped_vault::id,
                vault::all_columns,
                tenant::id,
                vault_data::all_columns,
            ))
            .get_results(conn.conn())
            .map_err(DbError::from)?;

        tracing::info!("found {} fingerprints to migrate", results.len());

        let mut results: MigrateDataMap = results
            .into_iter()
            .sorted_by(|(sv_id1, _, _, _), (sv_id2, _, _, _)| sv_id1.cmp(sv_id2))
            .group_by(|(sv, e, t_id, _)| (sv.clone(), e.clone(), t_id.clone()))
            .into_iter()
            .map(|((sv_id, e, t_id), g)| {
                let items = g.into_iter().map(|(_, _, _, d)| d).collect::<Vec<_>>();
                (sv_id, (e, t_id, items))
            })
            .collect();

        tracing::info!("found {} scoped vaults to migrate", results.len());

        // 2. next process vaults in chunks
        let scoped_vault_ids = { results.keys().cloned().collect_vec() };

        let handle = Handle::current();
        let _guard = handle.enter();

        // do in chunks of 100 vaults
        for chunk in scoped_vault_ids.chunks(100) {
            tracing::info!("migrating {} scoped vault fingerprints", chunk.len());

            let new_fingerprints = migrate_chunk(&state, &mut results, chunk);
            let new_fingerprints = futures::executor::block_on(new_fingerprints)?;

            db::models::fingerprint::Fingerprint::bulk_create(conn, new_fingerprints)?;
        }
        Ok(())
    }
}

/// helper function to migrate a chunk of data in parallel
async fn migrate_chunk<'a>(
    state: &MigrationState,
    map: &mut MigrateDataMap,
    vaults: &[ScopedVaultId],
) -> ApiResult<Vec<NewFingerprint>> {
    // 1. compute new fingperprints

    let futs = vaults
        .iter()
        .flat_map(|sv_id| map.remove(sv_id))
        .map(|(v, tenant_id, vds)| async move { create_new_fingerprints(state, &tenant_id, &v, vds).await })
        .collect_vec();

    let fingerprints = try_join_all(futs).await?.concat();
    Ok(fingerprints)
}

async fn create_new_fingerprints(
    state: &MigrationState,
    tenant_id: &TenantId,
    vault: &Vault,
    vds: Vec<VaultData>,
) -> ApiResult<Vec<NewFingerprint>> {
    let tenant_scoped_vault_data = vds
        .clone()
        .into_iter()
        .map(|vd| {
            // override to save them properly later
            (vd.kind.clone(), vd, FingerprintScopeKind::Tenant)
        })
        .collect_vec();

    let global_scoped_vault_data = vds
        .into_iter()
        // not all DIs are global, so need to enforce conversion and filter out bad ones even though
        // this should not have been possible, but it's possible the scope has changed since this code-enforced
        // not DB-enforced
        .filter_map(| vd| {
            let gfp = GlobalFingerprintKind::try_from(vd.kind.clone()).ok()?;
            Some((gfp, vd, FingerprintScopeKind::Global))
        })
        .collect_vec();

    // tenant scoped
    let tenant_scoped_fingerprints = {
        let sealed_data: Vec<((&DataIdentifier, &TenantId), &newtypes::SealedVaultBytes)> =
            tenant_scoped_vault_data
                .iter()
                .map(|(di, vd, _)| ((di, tenant_id), &vd.e_data))
                .collect_vec();

        state
            .enclave_client
            .batch_fingerprint_sealed(&vault.e_private_key, sealed_data)
            .await?
    };

    // global
    let global_scoped_fingerprints = {
        let sealed_data: Vec<(GlobalFingerprintKind, &newtypes::SealedVaultBytes)> = global_scoped_vault_data
            .iter()
            .map(|(gfp, vd, _)| (*gfp, &vd.e_data))
            .collect_vec();

        state
            .enclave_client
            .batch_fingerprint_sealed(&vault.e_private_key, sealed_data)
            .await?
    };

    // combine all the fingerprints
    let new_fingerprints = tenant_scoped_vault_data
        .into_iter()
        .zip(tenant_scoped_fingerprints)
        .chain(
            global_scoped_vault_data
                .into_iter()
                .map(|(gfp, vd, fp)| (gfp.data_identifier(), vd, fp))
                .zip(global_scoped_fingerprints),
        )
        .map(|((di, vd, fp_scope), sh_data)| NewFingerprint {
            sh_data,
            is_unique: fp_scope == FingerprintScopeKind::Global
                && di.globally_unique()
                && vault.is_portable
                && vault.is_live, // this matches our current logic
            kind: di,
            lifetime_id: vd.lifetime_id,
            scope: fp_scope,
            version: newtypes::FingerprintVersion::current(),
        })
        .collect_vec();

    Ok(new_fingerprints)
}

//! Migrates our old phone and email format that had the sandbox suffix encrypted inline to instead have sandbox suffix elsewhere.

use api_core::{enclave_client::EnclaveClient, errors::ApiResult, State};
use db::models::fingerprint::NewFingerprint;
use db_schema::schema::{data_lifetime, fingerprint, scoped_vault, vault, vault_data};
use futures::StreamExt;
use itertools::Itertools;
use newtypes::{
    fingerprinter::GlobalFingerprintKind, DataLifetimeId, Fingerprint, FingerprintScopeKind,
    FingerprintVersion, TenantId, VaultId, VdId,
};
use std::str::FromStr;
use tokio::runtime::Handle;

use db::{
    models::{vault::Vault, vault_data::VaultData},
    DbError, TxnPgConn,
};
use diesel::prelude::*;
use newtypes::{email::Email, DataIdentifier, IdentityDataKind, PhoneNumber, SealedVaultBytes};

use super::CustomMigration;

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

impl CustomMigration for Migration {
    type MigrationState = MigrationState;

    fn version() -> String {
        "061423".into()
    }

    fn run(self, state: MigrationState, conn: &mut TxnPgConn) -> ApiResult<()> {
        // Create backup DB table
        diesel::sql_query(
            "DROP TABLE IF EXISTS backfill_vault_data_update
        ",
        )
        .execute(conn.conn())
        .map_err(db::DbError::from)?;
        diesel::sql_query(
            "CREATE TABLE backfill_vault_data_update (
                id TEXT PRIMARY KEY,
                old_e_data BYTEA NOT NULL,
                new_e_data BYTEA NOT NULL
            )
        ",
        )
        .execute(conn.conn())
        .map_err(db::DbError::from)?;

        // 1. first get the vaults and vault data to migrate
        let results: Vec<(Vault, TenantId, VaultData)> = vault::table
            .inner_join(scoped_vault::table.inner_join(data_lifetime::table.inner_join(vault_data::table)))
            .filter(vault::is_live.eq(false))
            .filter(vault_data::kind.eq_any([
                DataIdentifier::from(IdentityDataKind::PhoneNumber),
                DataIdentifier::from(IdentityDataKind::Email),
            ]))
            .select((
                vault::all_columns,
                scoped_vault::tenant_id,
                vault_data::all_columns,
            ))
            .get_results(conn.conn())
            .map_err(DbError::from)?;

        tracing::info!("found {} phones/emails to migrate", results.len());

        // 2. next process vaults in chunks
        let handle = Handle::current();
        let _guard = handle.enter();

        // do in chunks of 1000 vaults
        for chunk in results.chunks(1000) {
            tracing::info!("migrating {} rows", chunk.len());

            let migrate_fut = migrate_chunk(&state, conn, chunk);
            futures::executor::block_on(migrate_fut)?;
        }
        Ok(())
    }
}

/// helper function to migrate a chunk of data in parallel
async fn migrate_chunk<'a>(
    state: &MigrationState,
    conn: &mut TxnPgConn<'a>,
    data: &[(Vault, TenantId, VaultData)],
) -> ApiResult<()> {
    // compute new and updated VDs
    let futs = data
        .iter()
        .map(|(v, t_id, vd)| async move { compute_single(state, v.clone(), t_id.clone(), vd.clone()).await })
        .collect_vec();
    // Only execute 10 futures at the same time - the enclave client poops out otherwise
    let stream = futures::stream::iter(futs).buffer_unordered(10);
    let updates = stream
        .collect::<Vec<_>>()
        .await
        .into_iter()
        .collect::<ApiResult<Vec<_>>>()?;
    let vd_updates = updates.iter().map(|u| u.0.clone()).collect_vec();
    let new_fps = updates.iter().flat_map(|u| u.1.clone()).collect_vec();
    let v_updates = updates.into_iter().filter_map(|u| u.2).collect_vec();

    // Save a backup of the old rows we are changing in case we need to restore
    diesel::insert_into(backfill_vault_data_update::table)
        .values(&vd_updates)
        .execute(conn.conn())
        .map_err(db::DbError::from)?;

    // Update the e_data on the existing rows
    for VaultDataUpdate {
        id,
        new_e_data,
        old_e_data: _,
    } in vd_updates
    {
        diesel::update(vault_data::table)
            .filter(vault_data::id.eq(id))
            .set(vault_data::e_data.eq(new_e_data))
            .execute(conn.conn())
            .map_err(DbError::from)?;
    }

    // Update the vaults' sandbox_ids
    for VaultUpdate { id, sandbox_id } in v_updates {
        diesel::update(vault::table)
            .filter(vault::id.eq(id))
            .set(vault::sandbox_id.eq(sandbox_id))
            .execute(conn.conn())
            .map_err(DbError::from)?;
    }

    // Add the new fingerprints of the data that doesn't include the sandbox suffix
    // TODO should we delete the old fingerprints that included the sandbox id? we don't really need to
    let fps = new_fps
        .into_iter()
        .map(|fp| NewFingerprint {
            sh_data: fp.sh_data,
            kind: fp.kind,
            lifetime_id: fp.lifetime_id,
            is_unique: false, // We used to make phone number fingerprints unique, but we can't anymore since there could be multiple sandbox users with the same phone
            version: FingerprintVersion::V2,
            scope: fp.scope,
        })
        .collect_vec();

    diesel::insert_into(fingerprint::table)
        .values(fps)
        .execute(conn.conn())
        .map_err(DbError::from)?;

    Ok(())
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    backfill_vault_data_update (id) {
        id -> Text,
        old_e_data -> Bytea,
        new_e_data -> Bytea,
    }
}

#[derive(Clone, diesel::Insertable)]
#[diesel(table_name = backfill_vault_data_update)]
struct VaultDataUpdate {
    id: VdId,
    old_e_data: SealedVaultBytes,
    new_e_data: SealedVaultBytes,
}

#[derive(Clone)]
struct VaultUpdate {
    id: VaultId,
    sandbox_id: String,
}

#[derive(Clone)]
struct NewFingerprintArgs {
    lifetime_id: DataLifetimeId,
    sh_data: Fingerprint,
    kind: DataIdentifier,
    scope: FingerprintScopeKind,
}

#[allow(clippy::unwrap_used)]
async fn compute_single(
    state: &MigrationState,
    vault: Vault,
    tenant_id: TenantId,
    vd: VaultData,
) -> ApiResult<(VaultDataUpdate, Vec<NewFingerprintArgs>, Option<VaultUpdate>)> {
    let decrypted = state
        .enclave_client
        .decrypt_to_piistring(&vd.e_data, &vault.e_private_key, vec![])
        .await?;
    let (pii, new_vd) = match &vd.kind {
        DataIdentifier::Id(IdentityDataKind::PhoneNumber) => {
            let phone_number = PhoneNumber::parse(decrypted)?;
            // We should only expect to see some legacy non-portable vaults with live emails in sandbox
            // if phone_number.is_live() && vault.is_portable {
            //     panic!("Non-live phone number for {}, {}", vault.id, vd.id);
            // }
            let sandbox_id = // if !phone_number.is_live() {
            //     phone_number.sandbox_suffix.clone()
            // } else {
                // Autofill sandbox id for the few non-portable sandbox vaults that had numbers without a suffix
                crypto::random::gen_random_alphanumeric_code(10);
            // };
            let vault_update = VaultUpdate {
                id: vault.id,
                sandbox_id,
            };
            (phone_number.e164(), Some(vault_update))
        }
        DataIdentifier::Id(IdentityDataKind::Email) => {
            // TODO do the same truncating email, but i don't think we should actually save the email's
            // sandbox suffix - hopefully it's the smae
            let email = Email::from_str(decrypted.leak())?;
            // We should only expect to see some legacy non-portable vaults with live emails in sandbox
            // Removing email.is_live()
            // if email.is_live() && vault.is_portable {
            //     panic!("Non-live email for {}, {}", vault.id, vd.id);
            // }
            (email.email, None)
        }
        // sanity check
        _ => panic!("Got non-phone non-email DI!"),
    };

    // Create new fingerprints that don't include the suffix
    let global_fp = if !vault.is_fixture {
        let fp = state
            .enclave_client
            .batch_fingerprint(&[(GlobalFingerprintKind::try_from(vd.kind.clone())?, &pii)])
            .await?
            .into_iter()
            .next()
            .unwrap();

        Some(NewFingerprintArgs {
            lifetime_id: vd.lifetime_id.clone(),
            sh_data: fp,
            kind: vd.kind.clone(),
            scope: FingerprintScopeKind::Global,
        })
    } else {
        None
    };
    // Normally, we only make tenant-scoped fingerprints for emails after the onboarding is authorized.
    // Does not matter much to me for these backfilled sandbox accounts, though
    let tenant_scoped_sh_data = state
        .enclave_client
        .batch_fingerprint(&[((&vd.kind, &tenant_id), &pii)])
        .await?
        .into_iter()
        .next()
        .unwrap();
    let tenant_fp = NewFingerprintArgs {
        lifetime_id: vd.lifetime_id.clone(),
        sh_data: tenant_scoped_sh_data,
        kind: vd.kind.clone(),
        scope: FingerprintScopeKind::Tenant,
    };
    let fps = [global_fp, Some(tenant_fp)].into_iter().flatten().collect();

    // Create vd update
    let new_e_data = vault.public_key.seal_pii(&pii)?;
    let vd_update = VaultDataUpdate {
        id: vd.id,
        old_e_data: vd.e_data,
        new_e_data,
    };
    Ok((vd_update, fps, new_vd))
}

/*
-- SQL to undo the migration:

BEGIN;

UPDATE vault
    SET sandbox_id = NULL;

UPDATE vault_data
    SET e_data = backfill_vault_data_update.old_e_data
    FROM backfill_vault_data_update
    WHERE vault_data.id = backfill_vault_data_update.id AND vault_data.e_data = backfill_vault_data_update.new_e_data;

-- Don't run this if we've already started creating new data, we'd delete some real v2 fingerprints
DELETE FROM fingerprint WHERE version = 'v2';

DELETE FROM custom_migration WHERE version = '061423';

COMMIT;
*/

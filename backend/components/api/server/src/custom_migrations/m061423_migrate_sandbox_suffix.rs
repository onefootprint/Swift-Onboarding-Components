//! Migrates our old phone and email format that had the sandbox suffix encrypted inline to instead have sandbox suffix elsewhere.

use api_core::{enclave_client::EnclaveClient, errors::ApiResult, State};
use db::schema::{data_lifetime, scoped_vault, vault, vault_data};
use enclave::DataTransform;
use futures::StreamExt;
use itertools::Itertools;
use newtypes::{VaultId, VdId};
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
        let results: Vec<(Vault, VaultData)> = vault::table
            .inner_join(scoped_vault::table.inner_join(data_lifetime::table.inner_join(vault_data::table)))
            .filter(vault::is_live.eq(false))
            .filter(vault_data::kind.eq_any([
                DataIdentifier::from(IdentityDataKind::PhoneNumber),
                DataIdentifier::from(IdentityDataKind::Email),
            ]))
            .select((vault::all_columns, vault_data::all_columns))
            .get_results(conn.conn())
            .map_err(DbError::from)?;

        tracing::info!("found {} phones/emails to migrate", results.len());

        // 2. next process vaults in chunks
        let handle = Handle::current();
        let _guard = handle.enter();

        // do in chunks of 100 vaults
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
    data: &[(Vault, VaultData)],
) -> ApiResult<()> {
    // compute new and updated VDs
    let futs = data
        .iter()
        .map(|(v, vd)| async move { compute_single(state, v.clone(), vd.clone()).await })
        .collect_vec();
    // Only execute 10 futures at the same time - the enclave client poops out otherwise
    let stream = futures::stream::iter(futs).buffer_unordered(10);
    let (vd_updates, v_updates): (Vec<_>, Vec<_>) = stream
        .collect::<Vec<_>>()
        .await
        .into_iter()
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .unzip();

    let v_updates = v_updates.into_iter().flatten().collect_vec();

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

#[derive(diesel::Insertable)]
#[diesel(table_name = backfill_vault_data_update)]
struct VaultDataUpdate {
    id: VdId,
    old_e_data: SealedVaultBytes,
    new_e_data: SealedVaultBytes,
}

struct VaultUpdate {
    id: VaultId,
    sandbox_id: String,
}

async fn compute_single(
    state: &MigrationState,
    vault: Vault,
    vd: VaultData,
) -> ApiResult<(VaultDataUpdate, Option<VaultUpdate>)> {
    let decrypted = state
        .enclave_client
        .decrypt_to_piistring(&vd.e_data, &vault.e_private_key, DataTransform::Identity)
        .await?;
    let (new_e_data, new_vd) = match vd.kind {
        DataIdentifier::Id(IdentityDataKind::PhoneNumber) => {
            let phone_number = PhoneNumber::parse(decrypted)?;
            assert!(!phone_number.is_live());
            let e_pii_without_suffix = vault.public_key.seal_pii(&phone_number.e164())?;
            let vault_update = VaultUpdate {
                id: vault.id,
                sandbox_id: phone_number.sandbox_suffix,
            };
            (e_pii_without_suffix, Some(vault_update))
        }
        DataIdentifier::Id(IdentityDataKind::Email) => {
            // TODO do the same truncating email, but i don't think we should actually save the email's
            // sandbox suffix - hopefully it's the smae
            let email = Email::from_str(decrypted.leak())?;
            assert!(!email.is_live());
            let e_pii_without_suffix = vault.public_key.seal_pii(&email.email)?;
            (e_pii_without_suffix, None)
        }
        // sanity check
        _ => panic!("Got non-phone non-email DI!"),
    };
    let vd_update = VaultDataUpdate {
        id: vd.id,
        old_e_data: vd.e_data,
        new_e_data,
    };
    Ok((vd_update, new_vd))
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

DELETE FROM custom_migration WHERE version = '061423';

COMMIT;
*/

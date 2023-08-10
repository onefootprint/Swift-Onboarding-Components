use super::CustomMigration;
use api_core::{errors::ApiResult, State};
use db::{private_cleanup_integration_tests, DbError, TxnPgConn};
use diesel::prelude::*;
use newtypes::VaultId;

pub struct Migration;

impl std::fmt::Debug for Migration {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!("CustomMigration({})", Self::version()).fmt(f)
    }
}

#[derive(Debug)]
/// Objects that migrations need to execute
pub struct MigrationState {}

impl From<State> for MigrationState {
    fn from(_value: State) -> Self {
        Self {}
    }
}

table! {
    use diesel::sql_types::*;

    duplicate_vaults (id) {
        id -> Text,
        tenant_name -> Text,
        tenant_id -> Text,
        vault_id -> Text,
        is_live -> Bool,
        count -> Int8,
    }
}

use diesel::sql_types::BigInt;

#[derive(QueryableByName)]
struct RowCount {
    #[diesel(sql_type = BigInt)]
    count: i64,
}

impl CustomMigration for Migration {
    type MigrationState = MigrationState;

    fn version() -> String {
        "080923".into()
    }

    fn run(self, _state: MigrationState, conn: &mut TxnPgConn) -> ApiResult<()> {
        // Save some pointers of data we deleted in case we need to check
        diesel::sql_query(
            "DROP TABLE IF EXISTS duplicate_vaults
        ",
        )
        .execute(conn.conn())
        .map_err(db::DbError::from)?;

        diesel::sql_query(
            "
            CREATE TABLE duplicate_vaults AS (
                SELECT
                    prefixed_uid('dv_') as id,
                    tenant.name AS tenant_name,
                    users.tenant_id,
                    users.vault_id,
                    users.is_live,
                    users.count
                FROM tenant INNER JOIN (
                    SELECT tenant_id, vault_id, is_live, count(*) AS count
                    FROM scoped_vault
                    GROUP by 1, 2, 3
                    HAVING COUNT(*) > 1
                ) AS users
                    ON users.tenant_id = tenant.id
            )
        ",
        )
        .execute(conn.conn())
        .map_err(db::DbError::from)?;

        diesel::sql_query("ALTER TABLE duplicate_vaults ADD PRIMARY KEY (id)")
            .execute(conn.conn())
            .map_err(db::DbError::from)?;

        diesel::sql_query(
            "DROP TABLE IF EXISTS duplicate_vault_fp_ids
        ",
        )
        .execute(conn.conn())
        .map_err(db::DbError::from)?;

        diesel::sql_query(
            "
            CREATE TABLE duplicate_vault_fp_ids AS (
                SELECT
                    prefixed_uid('dvfp_') as id,
                    scoped_vault.tenant_id,
                    scoped_vault.vault_id,
                    scoped_vault.is_live,
                    scoped_vault.fp_id
                FROM duplicate_vaults
                INNER JOIN scoped_vault
                    ON duplicate_vaults.vault_id = scoped_vault.vault_id
            )
        ",
        )
        .execute(conn.conn())
        .map_err(db::DbError::from)?;

        diesel::sql_query("ALTER TABLE duplicate_vault_fp_ids ADD PRIMARY KEY (id)")
            .execute(conn.conn())
            .map_err(db::DbError::from)?;

        let vault_ids_to_delete: Vec<_> = duplicate_vaults::table
            .select((
                duplicate_vaults::vault_id,
                duplicate_vaults::tenant_name,
                duplicate_vaults::is_live,
            ))
            .get_results::<(VaultId, String, bool)>(conn.conn())
            .map_err(DbError::from)?;

        tracing::info!("found {} user to rm", vault_ids_to_delete.len());
        assert!(vault_ids_to_delete.len() < 2500);

        for (v_id, t_name, is_live) in vault_ids_to_delete {
            assert!(
                !is_live || t_name == "Footprint Live" || t_name == "Acme Inc." || t_name == "Footprint Inc."
            );
            println!("deleting user: {}", v_id);
            let num_rows_deleted = private_cleanup_integration_tests(conn, v_id)?;
            println!("  deleted {} rows", num_rows_deleted);
            assert!(num_rows_deleted < 4000); // Just some safety in case
        }

        // Simple validation
        let num_duplicates = diesel::sql_query(
            "
            SELECT count(*) FROM
            (
                SELECT tenant_id, vault_id, is_live, count(*) AS count
                FROM scoped_vault
                GROUP by 1, 2, 3
                HAVING COUNT(*) > 1
            ) duplicate_users
        ",
        )
        .get_result::<RowCount>(conn.conn())
        .map_err(db::DbError::from)?
        .count;
        assert!(num_duplicates == 0);

        Ok(())
    }
}

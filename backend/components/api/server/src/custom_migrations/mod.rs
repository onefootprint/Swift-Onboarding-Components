//! Manages custom migrations that are managed by us
//! and executed at server startup time.
//!
//! They usually will involve a combination of DB operations and other async
//! operations (such as enclave, etc).
use api_core::{errors::ApiResult, State};
use byteorder::{BigEndian, ReadBytesExt};
use db::{DbError, DbResult, TxnPgConn};
use diesel::{sql_query, sql_types::BigInt, RunQueryDsl};

trait CustomMigration {
    type MigrationState;

    fn version() -> String;

    fn run(self, state: Self::MigrationState, conn: &mut TxnPgConn) -> ApiResult<()>;

    fn adivsory_xact_lock_value() -> ApiResult<i64> {
        let hash = crypto::sha256(Self::version().as_bytes());
        Ok((&hash[0..8]).read_i64::<BigEndian>()?)
    }
}

/// runs any active migrations that need to be run
pub async fn run(_state: &State) -> ApiResult<()> {
    // TODO Add any custom migrations here
    // run_migration(state, m080923_rm_multi_vaults::Migration).await?;
    Ok(())
}

#[tracing::instrument(skip(state))]
async fn run_migration<M>(state: &State, migration: M) -> ApiResult<()>
where
    M: CustomMigration + Send + Sync + std::fmt::Debug + 'static,
    M::MigrationState: From<State> + Send + 'static,
{
    tracing::info!("starting custom migration {}", M::version());

    // 0. first check if the migration is run to avoid grabbing an advisory lock
    let pre_flight_should_run = state
        .db_pool
        .db_query(move |conn| -> DbResult<bool> {
            Ok(
                db::models::custom_migration::CustomMigration::get_run_by_version(conn, &M::version())?
                    .is_none(),
            )
        })
        .await??;

    if !pre_flight_should_run {
        tracing::info!("skipping custom migration (preflight)");
        return Ok(());
    }

    let advisory_lock_value = M::adivsory_xact_lock_value()?;

    let mig_state = M::MigrationState::from(state.clone());

    // Run the migration inside a DB TXN
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<()> {
            // 1. take out the lock so no other servers can continue along the txn (we don't need to unlock it as it will be dropped after the txn)
            let _ = sql_query("SELECT pg_advisory_xact_lock($1);")
                .bind::<BigInt, _>(advisory_lock_value)
                .execute(conn.conn())
                .map_err(DbError::from)?;

            let is_run =
                db::models::custom_migration::CustomMigration::get_run_by_version(conn, &M::version())?;

            if is_run.is_some() {
                // exit
                tracing::info!("skipping already run custom migration");
                return Ok(());
            }

            // 2. run the migration
            migration.run(mig_state, conn)?;

            // 3. record the migration
            let _ = db::models::custom_migration::CustomMigration::did_run(M::version(), conn)?;

            Ok(())
        })
        .await?;

    tracing::info!("finished running custom migration {}", M::version());

    Ok(())
}

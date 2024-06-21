//! Manages custom migrations that are managed by us
//! and executed at server startup time.
//!
//! They usually will involve a combination of DB operations and other async
//! operations (such as enclave, etc).
use api_core::ApiCoreError;
use api_core::FpResult;
use api_core::State;
use byteorder::BigEndian;
use byteorder::ReadBytesExt;
use db::DbError;
use db::DbResult;
use db::TxnPgConn;
use diesel::sql_query;
use diesel::sql_types::BigInt;
use diesel::RunQueryDsl;

trait CustomMigration {
    type MigrationState;

    fn version() -> String;

    fn is_dry_run() -> bool {
        true
    }

    fn run(self, state: Self::MigrationState, conn: &mut TxnPgConn) -> FpResult<()>;

    fn adivsory_xact_lock_value() -> FpResult<i64> {
        let hash = crypto::sha256(Self::version().as_bytes());
        Ok((&hash[0..8]).read_i64::<BigEndian>()?)
    }
}

/// runs any active migrations that need to be run
pub async fn run(_state: &State) -> FpResult<()> {
    // TODO Add any custom migrations here
    // run_migration(state, m112223_backfill_portable_data::Migration).await?;
    Ok(())
}

#[tracing::instrument(skip(state))]
async fn run_migration<M>(state: &State, migration: M) -> FpResult<()>
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
        .await?;

    if !pre_flight_should_run {
        tracing::info!("skipping custom migration (preflight)");
        return Ok(());
    }

    let advisory_lock_value = M::adivsory_xact_lock_value()?;

    let mig_state = M::MigrationState::from(state.clone());

    // Run the migration inside a DB TXN
    let result = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<()> {
            // 1. take out the lock so no other servers can continue along the txn (we don't need to unlock it
            //    as it will be dropped after the txn)
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
            if M::is_dry_run() {
                // Some migrations run as a dry run and should never have their changes committed.
                return Err(ApiCoreError::MigrationDryRun.into());
            }

            // 3. record the migration
            let _ = db::models::custom_migration::CustomMigration::did_run(M::version(), conn)?;

            Ok(())
        })
        .await;
    if let Err(e) = result {
        // Swallow errors of kind MigrationDryRun. This allows the server to start up successfully
        // after a dry run
        if e.code() == Some(api_errors::MIGRATION_DRY_RUN.to_string()) {
            return Err(e);
        }
    }
    tracing::info!(dry_run= %M::is_dry_run(), version=%M::version(), "finished running custom migration");

    Ok(())
}

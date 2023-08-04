#![recursion_limit = "256"]

extern crate openssl; // this is needed because https://github.com/clux/muslrust#diesel-and-pq-builds

#[macro_use]
extern crate diesel;

extern crate diesel_migrations;

pub mod errors;

#[allow(clippy::extra_unused_lifetimes)]
pub mod models;

mod connection;

mod pagination;
pub use pagination::*;
mod instrumented_connection;

use std::time::Duration;

pub use crate::errors::DbError;
use deadpool::managed::{Hook, HookError};
use deadpool_diesel::postgres::Runtime;
use diesel::pg::PgConnection as DieselPgConnection;
use diesel::prelude::*;
use errors::TransactionError;

pub mod access_event;
pub mod actor;
mod has_lifetime;
pub mod scoped_vault;
pub use has_lifetime::*;

mod cleanup;
pub use cleanup::*;

// Old tests
#[cfg(test)]
mod test;
#[allow(unused)]
pub mod test_helpers;

pub mod tests;

// Wrapper around diesel's PgConnection that allows us to swap out the underlying conn implementation
// in one place
pub type PgConn = instrumented_connection::InstrumentedPgConnection;
pub type DbResult<T> = Result<T, DbError>;
pub use connection::TxnPgConn;

pub type Manager = deadpool_diesel::Manager<PgConn>;
pub type Pool = deadpool::managed::Pool<Manager, deadpool::managed::Object<Manager>>;
#[derive(Clone)]
pub struct DbPool(Pool);

impl DbPool {
    #[tracing::instrument(skip_all)]
    pub async fn db_query<F, R>(&self, f: F) -> Result<R, DbError>
    where
        F: FnOnce(&mut PgConn) -> R + Send + 'static,
        R: Send + 'static,
    {
        let current_span = tracing::info_span!("db query interact");

        let result = self
            .0
            .get()
            .await?
            .interact(move |conn| {
                let _guard = current_span.enter();
                f(conn)
            })
            .await
            .map_err(DbError::from)?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub async fn db_transaction<F, R, E>(&self, f: F) -> Result<R, E>
    where
        F: FnOnce(&mut TxnPgConn) -> Result<R, E> + Send + 'static,
        E: From<DbError> + Send + 'static,
        R: Send + 'static,
    {
        let result = self
            .db_query(|c: &mut PgConn| {
                c.transaction(|conn| -> Result<_, TransactionError<E>> {
                    // Any error returned by f() is an ApplicationError
                    let mut conn = TxnPgConn::new(conn);
                    f(&mut conn).map_err(|e| TransactionError::ApplicationError(e))
                })
            })
            .await?;
        // Return ApplicationErrors as-is. Map DbErrors to E
        result.map_err(|txn_error| match txn_error {
            TransactionError::ApplicationError(e) => e,
            TransactionError::DbError(e) => E::from(DbError::from(e)),
        })
    }
}

/// max age of a recycled connection in seconds (10min)
const CONNECTION_RECYCLE_MAX_AGES_SECS: u64 = 600;

/// Initialize our DB
pub fn init(url: &str) -> Result<DbPool, DbError> {
    let manager = Manager::new(url, Runtime::Tokio1);
    let pool = Pool::builder(manager)
        .runtime(Runtime::Tokio1)
        // .wait_timeout(Some(Duration::from_secs(1)))
        .recycle_timeout(Some(Duration::from_secs(1)))
        .create_timeout(Some(Duration::from_secs(4)))
        .pre_recycle(Hook::sync_fn(move |_, metrics| {
            let now = std::time::Instant::now();

            let recycled = metrics.recycled.map(|d| now.duration_since(d).as_secs());
            let created = now.duration_since(metrics.created).as_secs();

            // if the connection has been running for a while (10min) we can drop it
            // and force the pool to build a new one
            if created > CONNECTION_RECYCLE_MAX_AGES_SECS {
                tracing::debug!(
                    db.pool.recycled_secs_ago = recycled,
                    "db_pool.pre_recycle.drop_stale"
                );
                // this tells deadpool to continue the operation, but drop the connection
                // and build a new one
                return Err(HookError::Continue(None));
            }

            // log the pre recycle event
            tracing::debug!(
                db.pool.recycle_count = metrics.recycle_count,
                db.pool.created_secs_ago = created,
                db.pool.recycled_secs_ago = recycled,
                "db_pool.pre_recycle"
            );
            Ok(())
        }))
        .post_create(Hook::sync_fn(move |_, metrics| {
            let now = std::time::Instant::now();
            let created = now.duration_since(metrics.created).as_secs();
            tracing::debug!(db.pool.created_secs_ago = created, "db_pool.post_create");
            Ok(())
        }))
        .post_recycle(Hook::sync_fn(move |_, metrics| {
            let now = std::time::Instant::now();
            let recycled = metrics.recycled.map(|d| now.duration_since(d).as_secs());
            let created = now.duration_since(metrics.created).as_secs();

            tracing::debug!(
                db.pool.recycle_count = metrics.recycle_count,
                db.pool.created_secs_ago = created,
                db.pool.recycled_secs_ago = recycled,
                "db_pool.post_recycle"
            );
            Ok(())
        }))
        .max_size(50)
        .build()?;

    Ok(DbPool(pool))
}

#[tracing::instrument(skip_all)]
pub fn run_migrations(url: &str) -> Result<(), DbError> {
    use crate::diesel_migrations::MigrationHarness;
    let mut conn = DieselPgConnection::establish(url)?;
    log::info!("Running migrations");
    conn.run_pending_migrations(db_schema::MIGRATIONS)
        .map_err(DbError::MigrationFailed)?;
    log::info!("Migrations finished");
    Ok(())
}

pub async fn health_check(pool: &DbPool) -> Result<(), DbError> {
    pool.db_query(move |conn| diesel::sql_query("SELECT 1").execute(conn))
        .await??;

    Ok(())
}

sql_function!(fn nextval(a: diesel::sql_types::VarChar) -> diesel::sql_types::BigInt);

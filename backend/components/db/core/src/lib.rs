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

pub use crate::errors::DbError;
use deadpool::managed::Hook;
use deadpool::managed::HookError;
use deadpool_diesel::postgres::Runtime;
use diesel::connection::SimpleConnection;
use diesel::pg::PgConnection as DieselPgConnection;
use diesel::prelude::*;
use errors::TransactionError;
use std::time::Duration;

pub mod access_event;
pub mod actor;
mod has_lifetime;
pub mod scoped_vault;
pub use db_schema::schema;
pub use has_lifetime::*;

mod cleanup;
pub use cleanup::*;

mod non_null_array;
pub use non_null_array::*;

pub mod helpers;

// Old tests
#[cfg(test)]
mod test;
#[allow(unused)]
pub mod test_helpers;

pub mod tests;

// Wrapper around diesel's PgConnection that allows us to swap out the underlying conn
// implementation in one place
pub type PgConn = instrumented_connection::InstrumentedPgConnection;
pub type DbResult<T> = Result<T, DbError>;
pub use connection::TxnPgConn;

pub type Manager = deadpool_diesel::Manager<PgConn>;
pub type Pool = deadpool::managed::Pool<Manager, deadpool::managed::Object<Manager>>;
#[derive(Clone)]
pub struct DbPool(Pool);

impl DbPool {
    pub async fn db_query<F, R, E>(&self, f: F) -> Result<R, E>
    where
        F: FnOnce(&mut PgConn) -> Result<R, E> + Send + 'static,
        E: From<DbError> + Send + 'static + std::fmt::Debug,
        R: Send + 'static,
    {
        let current_span = tracing::info_span!("db_query::interact");
        let result = self
            .0
            .get()
            .await
            .map_err(DbError::from)?
            .interact(move |conn| {
                // Without adding a span inside here, none of the traces inside f will appear...
                let _guard = current_span.enter();
                f(conn)
            })
            .await
            .map_err(DbError::from)??;
        Ok(result)
    }

    pub async fn db_transaction<F, R, E>(&self, f: F) -> Result<R, E>
    where
        F: FnOnce(&mut TxnPgConn) -> Result<R, E> + Send + 'static,
        E: From<DbError> + Send + 'static + std::fmt::Debug,
        R: Send + 'static,
    {
        let result = self
            .db_query(|c: &mut PgConn| {
                c.transaction(|conn| -> Result<R, TransactionError<E>> {
                    // Any error returned by f() is an ApplicationError
                    let mut conn = TxnPgConn::new(conn);
                    f(&mut conn).map_err(|e| TransactionError::ApplicationError(e))
                })
            })
            .await;
        if let Err(e) = &result {
            tracing::info!(e=?e, "Rolling back transaction due to error");
        }
        // Return ApplicationErrors as-is. Map DbErrors to E
        result.map_err(|txn_error| match txn_error {
            TransactionError::ApplicationError(e) => e,
            TransactionError::DbError(e) => E::from(DbError::from(e)),
        })
    }
}

/// max age of a recycled connection in seconds (10min)
const CONNECTION_RECYCLE_MAX_AGE_SECS: u64 = 600;

/// Initialize our DB
pub fn init(url: &str, statement_timeout: Duration, max_conns: usize) -> Result<DbPool, DbError> {
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
            if created > CONNECTION_RECYCLE_MAX_AGE_SECS {
                tracing::debug!(
                    db.pool.recycled_secs_ago = recycled,
                    "db_pool.pre_recycle.drop_stale"
                );
                // this tells deadpool to continue the operation, but drop the connection
                // and build a new one
                return Err(HookError::message("connection older than max age"));
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
        .post_create(Hook::<Manager>::async_fn(move |conn, metrics| {
            Box::pin(async move {
                conn.interact(move |conn| -> QueryResult<_> {
                    let statement_timeout = statement_timeout.as_millis();
                    // bind() doesn't seem to work on SET queries.
                    diesel::sql_query(format!("SET statement_timeout = {}", statement_timeout)).execute(conn)?;
                    Ok(())
                }).await
                    .map_err(|err| HookError::message(err.to_string()))?
                    .map_err(|err| HookError::message(err.to_string()))?;

                let now = std::time::Instant::now();
                let created = now.duration_since(metrics.created).as_secs();
                tracing::debug!(db.pool.created_secs_ago = created, "db_pool.post_create");

                Ok(())
            })
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
        .max_size(max_conns)
        .build()?;

    Ok(DbPool(pool))
}

#[tracing::instrument(skip_all)]
pub fn run_migrations(url: &str) -> Result<(), DbError> {
    use crate::diesel_migrations::MigrationHarness;
    let mut conn = DieselPgConnection::establish(url)?;
    log::info!("Running migrations");

    // Cap how long migrations can take. Avoids mistakes like accidentally taking a table lock in a
    // long migration transaction.
    conn.batch_execute("SET statement_timeout = '3s'")?;

    conn.run_pending_migrations(db_schema::MIGRATIONS)
        .map_err(DbError::MigrationFailed)?;
    log::info!("Migrations finished");
    Ok(())
}

pub async fn health_check(pool: &DbPool) -> Result<(), DbError> {
    pool.db_query(move |conn| diesel::sql_query("SELECT 1").execute(conn).map_err(DbError::from))
        .await?;

    Ok(())
}

sql_function!(fn nextval(a: diesel::sql_types::VarChar) -> diesel::sql_types::BigInt);

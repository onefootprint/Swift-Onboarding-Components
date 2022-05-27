extern crate openssl; // this is needed because https://github.com/clux/muslrust#diesel-and-pq-builds

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate diesel_migrations;

pub mod errors;
pub mod models;

use std::time::Duration;

pub use crate::errors::DbError;
use deadpool::managed::Hook;
use deadpool_diesel::postgres::{Manager, Pool, Runtime};
pub use diesel::prelude::PgConnection;
use diesel::prelude::*;

#[allow(unused_imports)]
pub mod schema;

embed_migrations!();

pub type DbPool = Pool;

/// Initialize our DB
pub fn init(url: &str) -> Result<Pool, DbError> {
    let manager = Manager::new(url, Runtime::Tokio1);
    let pool = Pool::builder(manager)
        .runtime(Runtime::Tokio1)
        .recycle_timeout(Some(Duration::from_secs(1)))
        .create_timeout(Some(Duration::from_secs(1)))
        .post_create(Hook::sync_fn(|_, metrics| {
            tracing::info!(
                created = ?metrics.created,
                "db_pool conn post_created"
            );
            Ok(())
        }))
        .post_recycle(Hook::sync_fn(|_, metrics| {
            tracing::info!(
                recycle_count = metrics.recycle_count,
                created = ?metrics.created,
                recycled = ?metrics.recycled,
                "db_pool conn post_recycle"
            );
            Ok(())
        }))
        .max_size(12)
        .build()?;

    Ok(pool)
}

pub fn run_migrations(url: &str) -> Result<(), DbError> {
    let conn = PgConnection::establish(url)?;
    embedded_migrations::run(&conn)?;
    Ok(())
}

pub async fn health_check(pool: &Pool) -> Result<(), DbError> {
    let _ = pool
        .get()
        .await?
        .interact(move |conn| diesel::sql_query("SELECT 1").execute(conn))
        .await??;

    Ok(())
}

pub mod access_event;
pub mod onboarding;
pub mod session;
pub mod tenant;
#[cfg(test)]
pub mod test;
pub mod user_data;
pub mod user_vault;

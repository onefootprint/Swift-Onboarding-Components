extern crate openssl; // this is needed because https://github.com/clux/muslrust#diesel-and-pq-builds

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate diesel_migrations;

pub mod errors;
pub mod models;

use crate::errors::DbError;
use deadpool_diesel::postgres::{Manager, Pool, Runtime};
use diesel::prelude::*;

#[allow(unused_imports)]
pub mod schema;

embed_migrations!();

pub type DbPool = Pool;

/// Initialize our DB
pub fn init(url: &str) -> Result<Pool, DbError> {
    let manager = Manager::new(url, Runtime::Tokio1);
    let pool = Pool::builder(manager).max_size(8).build()?;

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

pub mod onboarding;
pub mod session;
pub mod tenant;
#[cfg(test)]
pub mod test;
pub mod user_vault;

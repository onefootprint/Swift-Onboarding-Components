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
use diesel_migrations::EmbeddedMigrations;
use models::onboardings::Onboarding;
use newtypes::{DataKind, Fingerprint};
use user_vault::get_by_fingerprint;

#[allow(unused_imports)]
pub mod schema;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

#[derive(Clone)]
pub struct DbPool(Pool);

impl DbPool {
    pub async fn db_query<F, R>(&self, f: F) -> Result<R, DbError>
    where
        F: FnOnce(&mut PgConnection) -> R + Send + 'static,
        R: Send + 'static,
    {
        let result = self
            .0
            .get()
            .await?
            .interact(move |conn| f(conn))
            .await
            .map_err(DbError::from)?;
        Ok(result)
    }

    pub async fn db_transaction<F, R>(&self, f: F) -> Result<R, DbError>
    where
        F: FnOnce(&mut PgConnection) -> Result<R, DbError> + Send + 'static,
        R: Send + 'static,
    {
        let result = self
            .db_query(|c: &mut PgConnection| c.build_transaction().run(|conn| f(conn)))
            .await??;
        Ok(result)
    }
}

/// Initialize our DB
pub fn init(url: &str) -> Result<DbPool, DbError> {
    let init_instant = std::time::Instant::now();

    let manager = Manager::new(url, Runtime::Tokio1);
    let pool = Pool::builder(manager)
        .runtime(Runtime::Tokio1)
        .recycle_timeout(Some(Duration::from_secs(1)))
        .create_timeout(Some(Duration::from_secs(1)))
        .post_create(Hook::sync_fn(move |_, metrics| {
            let created = metrics.created.duration_since(init_instant).as_secs();
            tracing::info!(db.pool.created_secs_ago = created, "db_pool.post_create");
            Ok(())
        }))
        .post_recycle(Hook::sync_fn(move |_, metrics| {
            let recycled = metrics.created.duration_since(init_instant).as_secs();
            let created = metrics.created.duration_since(init_instant).as_secs();

            tracing::debug!(
                db.pool.recycle_count = metrics.recycle_count,
                db.pool.created_secs_ago = created,
                db.pool.recycled_secs_ago = recycled,
                "db_pool.post_recycle"
            );
            Ok(())
        }))
        .max_size(12)
        .build()?;

    Ok(DbPool(pool))
}

pub fn run_migrations(url: &str) -> Result<(), DbError> {
    use crate::diesel_migrations::MigrationHarness;
    let mut conn = PgConnection::establish(url)?;
    conn.run_pending_migrations(MIGRATIONS)
        .map_err(DbError::MigrationFailed)?;
    Ok(())
}

pub async fn health_check(pool: &DbPool) -> Result<(), DbError> {
    let _ = pool
        .db_query(move |conn| diesel::sql_query("SELECT 1").execute(conn))
        .await??;

    Ok(())
}

pub async fn private_cleanup_integration_tests(pool: &DbPool, sh_data: Fingerprint) -> Result<(), DbError> {
    // we register users within our integration tests. to avoid filling up our database with fake information,
    // we clean up afterwards.
    let uv = get_by_fingerprint(pool, DataKind::PhoneNumber, sh_data, false).await?;
    if uv.is_none() {
        return Ok(());
    }
    let (uv, _) = uv.unwrap();

    pool.db_query(move |conn| -> Result<(), DbError> {
        // delete user data
        diesel::delete(schema::user_data::table.filter(schema::user_data::user_vault_id.eq(&uv.id)))
            .execute(conn)?;

        // grab onboardings, delete access events
        let obs: Vec<Onboarding> = schema::onboardings::table
            .filter(schema::onboardings::user_vault_id.eq(&uv.id))
            .get_results(conn)?;
        for ob in obs {
            diesel::delete(
                schema::access_events::table.filter(schema::access_events::onboarding_id.eq(&ob.id)),
            )
            .execute(conn)?;
        }

        // delete onboardings
        diesel::delete(schema::onboardings::table.filter(schema::onboardings::user_vault_id.eq(&uv.id)))
            .execute(conn)?;

        // delete webauthn
        diesel::delete(
            schema::webauthn_credentials::table
                .filter(schema::webauthn_credentials::user_vault_id.eq(&uv.id)),
        )
        .execute(conn)?;

        // delete audit trails
        diesel::delete(schema::audit_trails::table.filter(schema::audit_trails::user_vault_id.eq(&uv.id)))
            .execute(conn)?;

        // delete user vault
        diesel::delete(schema::user_vaults::table.filter(schema::user_vaults::id.eq(&uv.id)))
            .execute(conn)?;
        Ok(())
    })
    .await??;
    Ok(())
}

pub mod access_event;
pub mod onboarding;
pub mod session;
pub mod tenant;

pub mod user_data;
pub mod user_vault;
pub mod webauthn_credentials;

#[cfg(test)]
mod test;

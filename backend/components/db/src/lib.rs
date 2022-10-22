extern crate openssl; // this is needed because https://github.com/clux/muslrust#diesel-and-pq-builds

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate diesel_migrations;

pub mod errors;
pub mod test_helpers;

#[allow(clippy::extra_unused_lifetimes)]
pub mod models;

mod connection;
pub use connection::TxnPgConnection;

use std::time::Duration;

pub use crate::errors::DbError;
use deadpool::managed::{Hook, HookError};
use deadpool_diesel::postgres::{Manager, Pool, Runtime};
pub use diesel::prelude::PgConnection;
use diesel::prelude::*;
use diesel_migrations::EmbeddedMigrations;
use errors::TransactionError;
use newtypes::Fingerprint;
use user_vault::get_by_fingerprint;

#[allow(unused_imports)]
pub mod schema;

pub type DbResult<T> = Result<T, DbError>;

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

    pub async fn db_transaction<F, R, E>(&self, f: F) -> Result<R, E>
    where
        F: FnOnce(&mut TxnPgConnection) -> Result<R, E> + Send + 'static,
        E: From<DbError> + Send + 'static,
        R: Send + 'static,
    {
        let result = self
            .db_query(|c: &mut PgConnection| {
                c.build_transaction()
                    .run(|conn| -> Result<_, TransactionError<E>> {
                        // Any error returned by f() is an ApplicationError
                        let mut conn = TxnPgConnection::new(conn);
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
        .recycle_timeout(Some(Duration::from_secs(1)))
        .create_timeout(Some(Duration::from_secs(1)))
        .pre_recycle(Hook::sync_fn(move |_, metrics| {
            let now = std::time::Instant::now();

            let recycled = metrics.recycled.map(|d| now.duration_since(d).as_secs());
            let created = now.duration_since(metrics.created).as_secs();

            // if the connection has been running for a while (10min) we can drop it
            // and force the pool to build a new one
            if created > CONNECTION_RECYCLE_MAX_AGES_SECS {
                tracing::info!(
                    db.pool.recycled_secs_ago = recycled,
                    "db_pool.pre_recycle.drop_stale"
                );
                // this tells deadpool to continue the operation, but drop the connection
                // and build a new one
                return Err(HookError::Continue(None));
            }

            // log the pre recycle event
            tracing::info!(
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
            tracing::info!(db.pool.created_secs_ago = created, "db_pool.post_create");
            Ok(())
        }))
        .post_recycle(Hook::sync_fn(move |_, metrics| {
            let now = std::time::Instant::now();
            let recycled = metrics.recycled.map(|d| now.duration_since(d).as_secs());
            let created = now.duration_since(metrics.created).as_secs();

            tracing::info!(
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
    pool.db_query(move |conn| diesel::sql_query("SELECT 1").execute(conn))
        .await??;

    Ok(())
}

pub async fn private_cleanup_integration_tests(
    pool: &DbPool,
    sh_data: Fingerprint,
) -> Result<usize, DbError> {
    // we register users within our integration tests. to avoid filling up our database with fake information,
    // we clean up afterwards.
    let uv = get_by_fingerprint(pool, sh_data).await?;
    let uv = if let Some(uv) = uv {
        uv
    } else {
        return Ok(0);
    };

    let deleted_rows = pool
        .db_transaction(move |conn| -> Result<usize, DbError> {
            use schema::{
                access_event, audit_trail, document_request, email, fingerprint, identity_data,
                identity_document, onboarding, onboarding_decision,
                onboarding_decision_verification_result_junction, phone_number, requirement, risk_signal,
                scoped_user, user_timeline, user_vault, verification_request, verification_result,
                webauthn_credential,
            };
            let mut deleted_rows = 0;

            // delete user data
            deleted_rows += diesel::delete(requirement::table)
                .filter(requirement::user_vault_id.eq(&uv.id))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(webauthn_credential::table)
                .filter(webauthn_credential::user_vault_id.eq(&uv.id))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(audit_trail::table)
                .filter(audit_trail::user_vault_id.eq(&uv.id))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(user_timeline::table)
                .filter(user_timeline::user_vault_id.eq(&uv.id))
                .execute(conn.conn())?;

            // Scoped users
            {
                let su_ids = scoped_user::table
                    .filter(scoped_user::user_vault_id.eq(&uv.id))
                    .select(scoped_user::id);

                deleted_rows += diesel::delete(access_event::table)
                    .filter(access_event::scoped_user_id.eq_any(su_ids))
                    .execute(conn.conn())?;

                // Onboardings
                {
                    let ob_ids = onboarding::table
                        .filter(onboarding::scoped_user_id.eq_any(su_ids))
                        .select(onboarding::id);

                    // Onboarding decisions
                    {
                        let decision_ids = onboarding_decision::table
                            .filter(onboarding_decision::onboarding_id.eq_any(ob_ids))
                            .select(onboarding_decision::id);

                        deleted_rows +=
                            diesel::delete(onboarding_decision_verification_result_junction::table)
                                .filter(
                                    onboarding_decision_verification_result_junction::onboarding_decision_id
                                        .eq_any(decision_ids),
                                )
                                .execute(conn.conn())?;

                        deleted_rows += diesel::delete(risk_signal::table)
                            .filter(risk_signal::onboarding_decision_id.eq_any(decision_ids))
                            .execute(conn.conn())?;

                        deleted_rows += diesel::delete(onboarding_decision::table)
                            .filter(onboarding_decision::onboarding_id.eq_any(ob_ids))
                            .execute(conn.conn())?;
                    }

                    // Verification requests
                    {
                        let verification_request_ids = verification_request::table
                            .filter(verification_request::onboarding_id.eq_any(ob_ids))
                            .select(verification_request::id);

                        deleted_rows += diesel::delete(verification_result::table)
                            .filter(verification_result::request_id.eq_any(verification_request_ids))
                            .execute(conn.conn())?;

                        deleted_rows += diesel::delete(verification_request::table)
                            .filter(verification_request::onboarding_id.eq_any(ob_ids))
                            .execute(conn.conn())?;
                    }

                    deleted_rows += diesel::delete(document_request::table)
                        .filter(document_request::onboarding_id.eq_any(ob_ids))
                        .execute(conn.conn())?;

                    deleted_rows += diesel::delete(onboarding::table)
                        .filter(onboarding::scoped_user_id.eq_any(su_ids))
                        .execute(conn.conn())?;
                }

                // delete scoped_users
                deleted_rows += diesel::delete(scoped_user::table)
                    .filter(scoped_user::user_vault_id.eq(&uv.id))
                    .execute(conn.conn())?;
            }

            deleted_rows += diesel::delete(identity_document::table)
                .filter(identity_document::user_vault_id.eq(&uv.id))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(phone_number::table)
                .filter(phone_number::user_vault_id.eq(&uv.id))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(email::table)
                .filter(email::user_vault_id.eq(&uv.id))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(identity_data::table)
                .filter(identity_data::user_vault_id.eq(&uv.id))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(fingerprint::table)
                .filter(fingerprint::user_vault_id.eq(&uv.id))
                .execute(conn.conn())?;

            // delete user vault
            deleted_rows += diesel::delete(user_vault::table)
                .filter(user_vault::id.eq(&uv.id))
                .execute(conn.conn())?;
            Ok(deleted_rows)
        })
        .await?;
    Ok(deleted_rows)
}

pub mod access_event;
pub mod scoped_user;
pub mod tenant;
pub mod user_vault;

#[cfg(test)]
mod test;

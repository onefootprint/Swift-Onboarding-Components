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
use db_schema::schema::{decision_intent, incode_verification_session_event, user_consent};
use deadpool::managed::{Hook, HookError};
use deadpool_diesel::postgres::Runtime;
use diesel::pg::PgConnection as DieselPgConnection;
use diesel::prelude::*;
use errors::TransactionError;
use itertools::Itertools;
use newtypes::VaultId;

pub mod access_event;
pub mod actor;
mod has_lifetime;
pub mod scoped_vault;
pub use has_lifetime::*;

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
    conn.run_pending_migrations(db_schema::MIGRATIONS)
        .map_err(DbError::MigrationFailed)?;
    Ok(())
}

pub async fn health_check(pool: &DbPool) -> Result<(), DbError> {
    pool.db_query(move |conn| diesel::sql_query("SELECT 1").execute(conn))
        .await??;

    Ok(())
}

#[tracing::instrument(skip_all)]
pub fn private_cleanup_integration_tests(conn: &mut TxnPgConn, uvid: VaultId) -> Result<usize, DbError> {
    // we register users within our integration tests. to avoid filling up our database with fake information,
    // we clean up afterwards.

    use db_schema::schema::{
        access_event, annotation, business_owner, contact_info, data_lifetime, document_data,
        document_request, document_upload, fingerprint, fingerprint_visit_event, identity_document,
        incode_verification_session, liveness_event, manual_review, middesk_request, onboarding,
        onboarding_decision, onboarding_decision_verification_result_junction, risk_signal,
        risk_signal_group, scoped_vault, socure_device_session, user_timeline, vault, vault_data,
        verification_request, verification_result, watchlist_check, webauthn_credential, workflow,
        workflow_event,
    };
    let mut deleted_rows = 0;

    // First, get any business vaults related to this user and delete them.
    // If any business vaults are owned by another user vault, this will fail because of FK constraints
    let bv_ids: Vec<VaultId> = business_owner::table
        .filter(business_owner::user_vault_id.eq(&uvid))
        .select(business_owner::business_vault_id)
        .get_results(conn.conn())?;
    let v_ids = bv_ids.into_iter().chain([uvid]).collect_vec();

    // delete user data
    deleted_rows += diesel::delete(webauthn_credential::table)
        .filter(webauthn_credential::vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    deleted_rows += diesel::delete(user_timeline::table)
        .filter(user_timeline::vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    deleted_rows += diesel::delete(fingerprint_visit_event::table)
        .filter(fingerprint_visit_event::vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    deleted_rows += diesel::delete(business_owner::table)
        .filter(business_owner::user_vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    // DataLifetimes
    {
        let dl_ids = data_lifetime::table
            .filter(data_lifetime::vault_id.eq_any(&v_ids))
            .select(data_lifetime::id);

        deleted_rows += diesel::delete(vault_data::table)
            .filter(vault_data::lifetime_id.eq_any(dl_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(fingerprint::table)
            .filter(fingerprint::lifetime_id.eq_any(dl_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(contact_info::table)
            .filter(contact_info::lifetime_id.eq_any(dl_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(document_data::table)
            .filter(document_data::lifetime_id.eq_any(dl_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(data_lifetime::table)
            .filter(data_lifetime::vault_id.eq_any(&v_ids))
            .execute(conn.conn())?;
    }

    // Scoped users
    {
        let su_ids = scoped_vault::table
            .filter(scoped_vault::vault_id.eq_any(&v_ids))
            .select(scoped_vault::id);

        deleted_rows += diesel::delete(access_event::table)
            .filter(access_event::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(annotation::table)
            .filter(annotation::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(liveness_event::table)
            .filter(liveness_event::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(watchlist_check::table)
            .filter(watchlist_check::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        let dr_ids = document_request::table
            .filter(document_request::scoped_vault_id.eq_any(su_ids.clone()))
            .select(document_request::id);

        // Id documents
        {
            let id_doc_ids = identity_document::table
                .filter(identity_document::request_id.eq_any(dr_ids.clone()))
                .select(identity_document::id);

            deleted_rows += diesel::delete(document_upload::table)
                .filter(document_upload::document_id.eq_any(id_doc_ids.clone()))
                .execute(conn.conn())?;

            let incode_ids = incode_verification_session::table
                .filter(incode_verification_session::identity_document_id.eq_any(id_doc_ids.clone()))
                .select(incode_verification_session::id);

            deleted_rows += diesel::delete(incode_verification_session_event::table)
                .filter(incode_verification_session_event::incode_verification_session_id.eq_any(incode_ids))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(incode_verification_session::table)
                .filter(incode_verification_session::identity_document_id.eq_any(id_doc_ids))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(identity_document::table)
                .filter(identity_document::request_id.eq_any(dr_ids))
                .execute(conn.conn())?;
        }

        deleted_rows += diesel::delete(document_request::table)
            .filter(document_request::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(fingerprint_visit_event::table)
            .filter(
                fingerprint_visit_event::scoped_vault_id
                    .eq_any(su_ids.clone().select(scoped_vault::id.nullable())),
            )
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(decision_intent::table)
            .filter(decision_intent::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        // Onboardings
        {
            let ob_ids = onboarding::table
                .filter(onboarding::scoped_vault_id.eq_any(su_ids.clone()))
                .select(onboarding::id);

            deleted_rows += diesel::delete(manual_review::table)
                .filter(manual_review::onboarding_id.eq_any(ob_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(user_consent::table)
                .filter(user_consent::onboarding_id.eq_any(ob_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(socure_device_session::table)
                .filter(socure_device_session::onboarding_id.eq_any(ob_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(middesk_request::table)
                .filter(middesk_request::onboarding_id.eq_any(ob_ids.clone()))
                .execute(conn.conn())?;

            // Onboarding decisions
            {
                let decision_ids = onboarding_decision::table
                    .filter(onboarding_decision::onboarding_id.eq_any(ob_ids.clone()))
                    .select(onboarding_decision::id);

                deleted_rows += diesel::delete(onboarding_decision_verification_result_junction::table)
                    .filter(
                        onboarding_decision_verification_result_junction::onboarding_decision_id
                            .eq_any(decision_ids.clone()),
                    )
                    .execute(conn.conn())?;

                deleted_rows += diesel::delete(risk_signal::table)
                    .filter(risk_signal::onboarding_decision_id.eq_any(decision_ids.clone().nullable()))
                    .filter(risk_signal::verification_result_id.is_null())
                    .execute(conn.conn())?;

                deleted_rows += diesel::delete(risk_signal_group::table)
                    .filter(risk_signal_group::scoped_vault_id.eq_any(su_ids.clone()))
                    .execute(conn.conn())?;

                deleted_rows += diesel::delete(onboarding_decision::table)
                    .filter(onboarding_decision::onboarding_id.eq_any(ob_ids.clone()))
                    .execute(conn.conn())?;
            }

            // Verification requests
            {
                let verification_request_ids = verification_request::table
                    .filter(verification_request::scoped_vault_id.eq_any(su_ids.clone()))
                    .select(verification_request::id);

                let verification_result_ids = verification_result::table
                    .filter(verification_result::request_id.eq_any(verification_request_ids.clone()))
                    .select(verification_result::id);

                deleted_rows += diesel::delete(risk_signal::table)
                    .filter(risk_signal::verification_result_id.eq_any(verification_result_ids.clone()))
                    .execute(conn.conn())?;

                deleted_rows += diesel::delete(verification_result::table)
                    .filter(verification_result::request_id.eq_any(verification_request_ids))
                    .execute(conn.conn())?;

                deleted_rows += diesel::delete(verification_request::table)
                    .filter(verification_request::scoped_vault_id.eq_any(su_ids.clone()))
                    .execute(conn.conn())?;
            }

            deleted_rows += diesel::delete(onboarding::table)
                .filter(onboarding::scoped_vault_id.eq_any(su_ids.clone()))
                .execute(conn.conn())?;
        }

        // Workflows
        {
            let workflow_ids = workflow::table
                .filter(workflow::scoped_vault_id.eq_any(su_ids.clone()))
                .select(workflow::id);

            deleted_rows += diesel::delete(workflow_event::table)
                .filter(workflow_event::workflow_id.eq_any(workflow_ids))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(workflow::table)
                .filter(workflow::scoped_vault_id.eq_any(su_ids.clone()))
                .execute(conn.conn())?;
        }

        // delete scoped_users
        deleted_rows += diesel::delete(scoped_vault::table)
            .filter(scoped_vault::vault_id.eq_any(&v_ids))
            .execute(conn.conn())?;
    }

    // delete user vault
    deleted_rows += diesel::delete(vault::table)
        .filter(vault::id.eq_any(&v_ids))
        .execute(conn.conn())?;

    Ok(deleted_rows)
}

sql_function!(fn nextval(a: diesel::sql_types::VarChar) -> diesel::sql_types::BigInt);

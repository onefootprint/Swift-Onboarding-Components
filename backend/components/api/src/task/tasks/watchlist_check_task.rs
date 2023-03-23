use crate::task::{ExecuteTask, TaskError};
use async_trait::async_trait;
use db::{
    models::{
        decision_intent::DecisionIntent, task::Task, verification_request::VerificationRequest,
        verification_result::VerificationResult, watchlist_check::WatchlistCheck,
    },
    DbError, DbPool, DbResult, PgConn,
};
use newtypes::{DecisionIntentKind, ScopedVaultId, TaskId, VendorAPI, WatchlistCheckArgs};

pub(crate) struct WatchlistCheckTask {
    db_pool: DbPool,
    task_id: TaskId,
}

impl WatchlistCheckTask {
    pub fn new(db_pool: DbPool, task_id: TaskId) -> Self {
        Self { db_pool, task_id }
    }
}

#[async_trait]
impl ExecuteTask<WatchlistCheckArgs> for WatchlistCheckTask {
    async fn execute(&self, args: &WatchlistCheckArgs) -> Result<(), TaskError> {
        let scoped_vault_id = args.scoped_vault_id.clone();
        let task_id = self.task_id.clone();

        let (_watchlist_check, _vreq, _vres) = self
            .db_pool
            .db_transaction(move |conn| -> DbResult<_> {
                // not strictly needed since we ever only execute a single task 1 at a time, but nice to be extra safe
                let _task = Task::lock(conn, &task_id)?;

                match Self::get_existing_watchlist_check(conn, &task_id)? {
                    Some((wc, vreq, vres)) => Ok((wc, vreq, vres)),
                    None => {
                        let (wc, vreq) = Self::create_new_watchlist_check(conn, &task_id, &scoped_vault_id)?;
                        Ok((wc, vreq, None))
                    }
                }
            })
            .await?;

        // TODO: make vendor call + save vres
        // TODO: calculate decision and update WatchlistCheck

        Ok(())
    }
}

impl WatchlistCheckTask {
    fn get_existing_watchlist_check(
        conn: &mut PgConn,
        task_id: &TaskId,
    ) -> Result<Option<(WatchlistCheck, VerificationRequest, Option<VerificationResult>)>, DbError> {
        let existing_watchlist_check = WatchlistCheck::get_by_task_id(conn, task_id)?;
        if let Some(wc) = existing_watchlist_check {
            let (vreq, vres, _) =
                VerificationRequest::list_by_decision_intent_id(conn, &wc.decision_intent_id)?
                    .pop()
                    .ok_or(DbError::RelatedObjectNotFound)?;

            Ok(Some((wc, vreq, vres)))
        } else {
            Ok(None)
        }
    }

    fn create_new_watchlist_check(
        conn: &mut PgConn,
        task_id: &TaskId,
        scoped_vault_id: &ScopedVaultId,
    ) -> Result<(WatchlistCheck, VerificationRequest), DbError> {
        let decision_intent =
            DecisionIntent::create(conn, DecisionIntentKind::WatchlistCheck, scoped_vault_id)?;

        let verification_request =
            VerificationRequest::create(conn, scoped_vault_id, &decision_intent.id, VendorAPI::IdologyPa)?;

        let watchlist_check = WatchlistCheck::create(
            conn,
            scoped_vault_id.clone(),
            task_id.clone(),
            decision_intent.id.clone(),
        )?;
        Ok((watchlist_check, verification_request))
    }
}

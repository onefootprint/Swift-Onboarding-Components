use std::collections::HashMap;

use chrono::{DateTime, Duration, Utc};
use diesel::{
    dsl::{count, count_star, not},
    prelude::*,
};
use newtypes::{
    DecisionIntentId, FootprintReasonCode, ScopedVaultId, TaskId, TenantId, VaultKind, WatchlistCheckId,
    WatchlistCheckStatus, WatchlistCheckStatusKind,
};
use serde::{Deserialize, Serialize};

use crate::{
    schema::{onboarding, scoped_vault, task, vault, watchlist_check},
    DbResult, PgConn, TxnPgConn,
};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = watchlist_check)]
pub struct WatchlistCheck {
    pub id: WatchlistCheckId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,

    pub scoped_vault_id: ScopedVaultId,
    pub task_id: TaskId,
    pub decision_intent_id: Option<DecisionIntentId>,
    pub status: WatchlistCheckStatusKind,
    pub logic_git_hash: Option<String>, // written when status is updated to Pass, Fail, or Error
    pub reason_codes: Option<Vec<FootprintReasonCode>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub status_details: WatchlistCheckStatus,
    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = watchlist_check)]
pub struct NewWatchlistCheck {
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub task_id: TaskId,
    pub decision_intent_id: Option<DecisionIntentId>,
    pub status: WatchlistCheckStatusKind,
    pub completed_at: Option<DateTime<Utc>>,
    pub status_details: WatchlistCheckStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset)]
#[diesel(table_name = watchlist_check)]
struct UpdateWatchlistCheck {
    pub status: WatchlistCheckStatusKind,
    pub logic_git_hash: Option<String>,
    pub reason_codes: Option<Vec<FootprintReasonCode>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub status_details: WatchlistCheckStatus,
}

impl WatchlistCheck {
    /// Deactivate the old completed WatchlistCheck for this user since we are only allowed to have
    /// one active, completed WatchlistCheck at a time
    #[tracing::instrument("WatchlistCheck::deactivate_old", skip_all)]
    fn deactivate_old(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        timestamp: DateTime<Utc>,
    ) -> DbResult<()> {
        diesel::update(watchlist_check::table)
            .filter(watchlist_check::scoped_vault_id.eq(scoped_vault_id))
            .filter(watchlist_check::deactivated_at.is_null())
            .filter(not(watchlist_check::completed_at.is_null()))
            .set(watchlist_check::deactivated_at.eq(timestamp))
            .execute(conn)?;
        Ok(())
    }

    #[tracing::instrument("WatchlistCheck::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        scoped_vault_id: ScopedVaultId,
        task_id: TaskId,
        decision_intent_id: Option<DecisionIntentId>,
        status: WatchlistCheckStatus,
    ) -> DbResult<Self> {
        let timestamp = Utc::now();
        // Mark the watchlist check as completed if it has a terminal status
        let completed_at = match status {
            WatchlistCheckStatus::Pending => None,
            _ => Some(timestamp),
        };
        if let Some(completed_at) = completed_at {
            Self::deactivate_old(conn, &scoped_vault_id, completed_at)?;
        }
        let new_watchlist_check = NewWatchlistCheck {
            created_at: timestamp,
            scoped_vault_id,
            task_id,
            decision_intent_id,
            status: status.into(),
            completed_at,
            status_details: status,
        };

        let res = diesel::insert_into(watchlist_check::table)
            .values(new_watchlist_check)
            .get_result(conn.conn())?;

        Ok(res)
    }

    #[tracing::instrument("WatchlistCheck::get_by_task_id", skip_all)]
    pub fn get_by_task_id(conn: &mut PgConn, task_id: &TaskId) -> DbResult<Option<Self>> {
        let res = watchlist_check::table
            .filter(watchlist_check::task_id.eq(task_id))
            .get_result(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument("WatchlistCheck::update", skip_all)]
    pub fn update(
        self,
        conn: &mut TxnPgConn,
        status: WatchlistCheckStatus,
        logic_git_hash: Option<String>,
        reason_codes: Option<Vec<FootprintReasonCode>>,
        completed_at: Option<DateTime<Utc>>,
    ) -> DbResult<Self> {
        if let Some(completed_at) = completed_at {
            Self::deactivate_old(conn, &self.scoped_vault_id, completed_at)?;
        }
        let update = UpdateWatchlistCheck {
            status: status.into(),
            logic_git_hash,
            reason_codes,
            completed_at,
            status_details: status,
        };
        let result = diesel::update(watchlist_check::table)
            .filter(watchlist_check::id.eq(&self.id))
            .set(update)
            .get_result(conn.conn())?;

        Ok(result)
    }

    #[tracing::instrument("WatchlistCheck::get_billable_count", skip_all)]
    pub fn get_billable_count(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> DbResult<i64> {
        use crate::schema::scoped_vault;
        let count = watchlist_check::table
            .inner_join(scoped_vault::table)
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(true))
            // Only want to bill for material watchlist checks that made vendor requests
            .filter(watchlist_check::status.eq_any(vec![WatchlistCheckStatusKind::Pass, WatchlistCheckStatusKind::Fail]))
            // Filter for watchlist checks that completed during this billing period
            .filter(watchlist_check::completed_at.ge(start_date))
            .filter(watchlist_check::completed_at.lt(end_date))
            .select(count_star())
            .get_result(conn)?;
        Ok(count)
    }

    // #[cfg(test)]
    #[tracing::instrument("WatchlistCheck::_get_by_svid", skip_all)]
    pub fn _get_by_svid(conn: &mut PgConn, svid: &ScopedVaultId) -> DbResult<Self> {
        let res = watchlist_check::table
            .filter(watchlist_check::scoped_vault_id.eq(svid))
            .get_result(conn)?;
        Ok(res)
    }

    #[tracing::instrument("WatchlistCheck::get_bulk", skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<&WatchlistCheckId>,
    ) -> DbResult<HashMap<WatchlistCheckId, Self>> {
        let results = watchlist_check::table
            .filter(watchlist_check::id.eq_any(ids))
            .get_results::<WatchlistCheck>(conn)?
            .into_iter()
            .map(|d| (d.id.clone(), d))
            .collect();

        Ok(results)
    }

    #[tracing::instrument("WatchlistCheck::get_overdue_scoped_vaults", skip_all)]
    pub fn get_overdue_scoped_vaults(conn: &mut PgConn, tenant_id: TenantId) -> DbResult<Vec<ScopedVaultId>> {
        let thirty_days_ago = Utc::now() - Duration::days(30);

        let res = scoped_vault::table
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(true))
            .inner_join(vault::table.on(vault::id.eq(scoped_vault::vault_id)))
            .filter(vault::kind.eq(VaultKind::Person))
            .select(scoped_vault::id)
            .left_join(
                onboarding::table.on(onboarding::scoped_vault_id
                    .eq(scoped_vault::id)
                    .and(onboarding::decision_made_at.ge(thirty_days_ago))),
            )
            .left_join(
                watchlist_check::table.on(watchlist_check::scoped_vault_id
                    .eq(scoped_vault::id)
                    .and(watchlist_check::created_at.ge(thirty_days_ago))),
            )
            .left_join(
                task::table.on(task::task_data
                    .retrieve_by_path_as_text(vec!["data", "scoped_vault_id"])
                    .eq(scoped_vault::id)
                    .and(
                        task::task_data
                            .retrieve_by_path_as_text(vec!["kind"])
                            .eq("watchlist_check"),
                    )
                    .and(task::created_at.ge(thirty_days_ago))),
            )
            .group_by(scoped_vault::id)
            .having(
                count(onboarding::id)
                    .eq(0)
                    .and(count(watchlist_check::id).eq(0))
                    .and(count(task::id).eq(0)),
            )
            .get_results(conn)?;

        Ok(res)
    }

    #[cfg(test)]
    #[tracing::instrument("WatchlistCheck::create_for_test", skip_all)]
    pub fn create_for_test(conn: &mut PgConn, new_watchlist_check: NewWatchlistCheck) -> DbResult<Self> {
        if let Some(completed_at) = new_watchlist_check.completed_at {
            Self::deactivate_old(conn, &new_watchlist_check.scoped_vault_id, completed_at)?;
        }
        let res = diesel::insert_into(watchlist_check::table)
            .values(new_watchlist_check)
            .get_result(conn)?;
        Ok(res)
    }
}

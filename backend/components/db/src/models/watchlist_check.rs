use chrono::{DateTime, Utc};
use diesel::{dsl::count_star, prelude::*};
use newtypes::{
    DecisionIntentId, FootprintReasonCode, ScopedVaultId, TaskId, TenantId, WatchlistCheckId,
    WatchlistCheckStatus,
};
use serde::{Deserialize, Serialize};

use crate::{schema::watchlist_check, DbResult, PgConn};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = watchlist_check)]
pub struct WatchlistCheck {
    pub id: WatchlistCheckId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,

    pub scoped_vault_id: ScopedVaultId,
    pub task_id: TaskId,
    pub decision_intent_id: DecisionIntentId,
    pub status: WatchlistCheckStatus,
    pub logic_git_hash: Option<String>, // written when status is updated to Pass, Fail, or Error
    pub reason_codes: Option<Vec<FootprintReasonCode>>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = watchlist_check)]
struct NewWatchlistCheck {
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub task_id: TaskId,
    pub decision_intent_id: DecisionIntentId,
    pub status: WatchlistCheckStatus,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset)]
#[diesel(table_name = watchlist_check)]
pub struct UpdateWatchlistCheck {
    pub status: WatchlistCheckStatus,
    pub logic_git_hash: Option<String>,
    pub reason_codes: Option<Vec<FootprintReasonCode>>,
    pub completed_at: Option<DateTime<Utc>>,
}

impl WatchlistCheck {
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut PgConn,
        scoped_vault_id: ScopedVaultId,
        task_id: TaskId,
        decision_intent_id: DecisionIntentId,
        status: WatchlistCheckStatus,
    ) -> DbResult<Self> {
        let timestamp = Utc::now();
        // Mark the watchlist check as completed if it has a terminal status
        let completed_at = match status {
            WatchlistCheckStatus::Pending => None,
            _ => Some(timestamp),
        };
        let new_watchlist_check = NewWatchlistCheck {
            created_at: timestamp,
            scoped_vault_id,
            task_id,
            decision_intent_id,
            status,
            completed_at,
        };

        let res = diesel::insert_into(watchlist_check::table)
            .values(new_watchlist_check)
            .get_result(conn)?;
        Ok(res)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_by_task_id(conn: &mut PgConn, task_id: &TaskId) -> DbResult<Option<Self>> {
        let res = watchlist_check::table
            .filter(watchlist_check::task_id.eq(task_id))
            .get_result(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument(skip_all)]
    pub fn update(conn: &mut PgConn, id: &WatchlistCheckId, update: UpdateWatchlistCheck) -> DbResult<Self> {
        let result = diesel::update(watchlist_check::table)
            .filter(watchlist_check::id.eq(id))
            .set(update)
            .get_result(conn)?;

        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_billable_count(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> DbResult<i64> {
        use crate::schema::scoped_user;
        let count = watchlist_check::table
            .inner_join(scoped_user::table)
            .filter(scoped_user::tenant_id.eq(tenant_id))
            .filter(scoped_user::is_live.eq(true))
            // Only want to bill for material watchlist checks that made vendor requests
            .filter(watchlist_check::status.eq_any(vec![WatchlistCheckStatus::Pass, WatchlistCheckStatus::Fail]))
            // Filter for watchlist checks that completed during this billing period
            .filter(watchlist_check::completed_at.ge(start_date))
            .filter(watchlist_check::completed_at.lt(end_date))
            .select(count_star())
            .get_result(conn)?;
        Ok(count)
    }

    // #[cfg(test)]
    pub fn _get_by_svid(conn: &mut PgConn, svid: &ScopedVaultId) -> DbResult<Self> {
        let res = watchlist_check::table
            .filter(watchlist_check::scoped_vault_id.eq(svid))
            .get_result(conn)?;
        Ok(res)
    }
}

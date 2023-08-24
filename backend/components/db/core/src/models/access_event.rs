use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::access_event;
use diesel::dsl::count_distinct;
use diesel::prelude::*;
use diesel::{Insertable, Queryable, RunQueryDsl};
use itertools::Itertools;
use newtypes::VaultKind;
use newtypes::{
    AccessEventId, AccessEventKind, DataIdentifier, DbActor, InsightEventId, ScopedVaultId, TenantId,
};
use serde::{Deserialize, Serialize};

use super::insight_event::CreateInsightEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = access_event)]
pub struct AccessEvent {
    pub id: AccessEventId,
    pub scoped_vault_id: ScopedVaultId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub reason: Option<String>,
    pub principal: DbActor,
    pub ordering_id: i64,
    pub kind: AccessEventKind,
    pub targets: Vec<DataIdentifier>,
    /// Denormalized from scoped_vault for faster querying
    pub tenant_id: TenantId,
    /// Denormalized from scoped_vault for faster querying
    pub is_live: bool,
}

#[derive(Debug, Clone)]
pub struct NewAccessEvent {
    pub scoped_vault_id: ScopedVaultId,
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub reason: Option<String>,
    pub principal: DbActor,
    pub insight: CreateInsightEvent,
    pub kind: AccessEventKind,
    pub targets: Vec<DataIdentifier>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = access_event)]
pub struct NewAccessEventRow {
    pub scoped_vault_id: ScopedVaultId,
    pub insight_event_id: InsightEventId,
    pub reason: Option<String>,
    pub principal: DbActor,
    pub kind: AccessEventKind,
    pub targets: Vec<DataIdentifier>,
    pub tenant_id: TenantId,
    pub is_live: bool,
}

impl NewAccessEvent {
    #[tracing::instrument("NewAccessEvent::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<()> {
        let insight_ev = self.insight.insert_with_conn(conn)?;
        let event = NewAccessEventRow {
            scoped_vault_id: self.scoped_vault_id,
            insight_event_id: insight_ev.id,
            reason: self.reason,
            principal: self.principal,
            kind: self.kind,
            targets: self.targets,
            tenant_id: self.tenant_id,
            is_live: self.is_live,
        };

        diesel::insert_into(access_event::table)
            .values(event)
            .execute(conn)?;

        Ok(())
    }
}

impl AccessEvent {
    #[tracing::instrument("AccessEvent::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut PgConn, rows: Vec<NewAccessEventRow>) -> DbResult<()> {
        let rows = rows.into_iter().filter(|r| !r.targets.is_empty()).collect_vec();
        diesel::insert_into(access_event::table)
            .values(rows)
            .execute(conn)?;

        Ok(())
    }

    #[tracing::instrument("AccessEvent::count_hot_vaults", skip_all)]
    pub fn count_hot_vaults(
        conn: &mut PgConn,
        t_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> DbResult<i64> {
        // TODO do we want to bill for hot business vaults? Probably just want to consider the user hot,
        // but that's hard
        use db_schema::schema::{scoped_vault, vault};
        let count = access_event::table
            .inner_join(scoped_vault::table.inner_join(vault::table))
            // Cookie-cutter filters for all billable events
            .filter(scoped_vault::is_live.eq(true))
            .filter(scoped_vault::tenant_id.eq(t_id))
            .filter(vault::kind.eq(VaultKind::Person))
            // Filter for access events made during this billing period
            .filter(access_event::timestamp.ge(start_date))
            .filter(access_event::timestamp.lt(end_date))
            .select(count_distinct(scoped_vault::id))
            .get_result(conn)?;
        Ok(count)
    }
}

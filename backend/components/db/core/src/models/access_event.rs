use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::access_event;
use diesel::{Insertable, Queryable, RunQueryDsl};
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
    pub tenant_id: Option<TenantId>,
    /// Denormalized from scoped_vault for faster querying
    pub is_live: Option<bool>,
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
struct NewAccessEventWithInsight {
    scoped_vault_id: ScopedVaultId,
    insight_event_id: InsightEventId,
    reason: Option<String>,
    principal: DbActor,
    kind: AccessEventKind,
    targets: Vec<DataIdentifier>,
    tenant_id: TenantId,
    is_live: bool,
}

impl NewAccessEvent {
    #[tracing::instrument("NewAccessEvent::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> Result<(), crate::DbError> {
        let insight_ev = self.insight.insert_with_conn(conn)?;
        let event = NewAccessEventWithInsight {
            scoped_vault_id: self.scoped_vault_id,
            insight_event_id: insight_ev.id,
            reason: self.reason,
            principal: self.principal,
            kind: self.kind,
            targets: self.targets,
            tenant_id: self.tenant_id,
            is_live: self.is_live,
        };

        diesel::insert_into(db_schema::schema::access_event::table)
            .values(event)
            .execute(conn)?;

        Ok(())
    }
}

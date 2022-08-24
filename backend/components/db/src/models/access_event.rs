use crate::schema::access_event;
use crate::DbPool;
use chrono::{DateTime, Utc};
use diesel::{Connection, Insertable, PgConnection, Queryable, RunQueryDsl};
use newtypes::{AccessEventId, AccessEventKind, DataIdentifier, InsightEventId, ScopedUserId};
use serde::{Deserialize, Serialize};

use super::insight_event::CreateInsightEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = access_event)]
pub struct AccessEvent {
    pub id: AccessEventId,
    pub scoped_user_id: ScopedUserId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub reason: Option<String>,
    pub principal: String,
    pub ordering_id: i64,
    pub kind: AccessEventKind,
    pub targets: Vec<DataIdentifier>,
}

#[derive(Debug, Clone)]
pub struct NewAccessEvent {
    pub scoped_user_id: ScopedUserId,
    pub reason: Option<String>,
    pub principal: String,
    pub insight: CreateInsightEvent,
    pub kind: AccessEventKind,
    pub targets: Vec<DataIdentifier>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = access_event)]
struct NewAccessEventWithInsight {
    scoped_user_id: ScopedUserId,
    insight_event_id: InsightEventId,
    reason: Option<String>,
    principal: String,
    kind: AccessEventKind,
    targets: Vec<DataIdentifier>,
}

impl NewAccessEvent {
    pub async fn save(self, pool: &DbPool) -> Result<(), crate::DbError> {
        pool.db_query(move |conn| conn.transaction(|conn| self.create(conn)))
            .await??;
        Ok(())
    }

    pub fn create(self, conn: &mut PgConnection) -> Result<(), crate::DbError> {
        let insight_ev = self.insight.insert_with_conn(conn)?;
        let event = NewAccessEventWithInsight {
            scoped_user_id: self.scoped_user_id,
            insight_event_id: insight_ev.id,
            reason: self.reason,
            principal: self.principal,
            kind: self.kind,
            targets: self.targets,
        };

        diesel::insert_into(crate::schema::access_event::table)
            .values(event)
            .execute(conn)?;

        Ok(())
    }
}

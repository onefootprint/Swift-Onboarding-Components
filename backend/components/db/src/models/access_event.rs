use crate::DbPool;
use crate::{schema::access_event, DbError};
use chrono::{DateTime, Utc};
use diesel::{Connection, Insertable, Queryable, RunQueryDsl};
use newtypes::{AccessEventId, DataAttribute, InsightEventId, ScopedUserId};
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
    pub reason: String,
    pub principal: Option<String>,
    pub data_kinds: Vec<DataAttribute>,
    pub ordering_id: i64,
}

#[derive(Debug, Clone)]
pub struct NewAccessEvent {
    pub scoped_user_id: ScopedUserId,
    pub data_kinds: Vec<DataAttribute>,
    pub reason: String,
    pub principal: Option<String>,
    pub insight: CreateInsightEvent,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = access_event)]
struct NewAccessEventWithInsight {
    scoped_user_id: ScopedUserId,
    data_kinds: Vec<DataAttribute>,
    insight_event_id: InsightEventId,
    reason: String,
    principal: Option<String>,
}

impl NewAccessEvent {
    pub async fn save(self, pool: &DbPool) -> Result<(), crate::DbError> {
        pool.db_query(move |conn| {
            conn.transaction(|conn| -> Result<(), DbError> {
                let insight_ev = self.insight.insert_with_conn(conn)?;
                let event = NewAccessEventWithInsight {
                    data_kinds: self.data_kinds,
                    scoped_user_id: self.scoped_user_id,
                    insight_event_id: insight_ev.id,
                    reason: self.reason,
                    principal: self.principal,
                };

                diesel::insert_into(crate::schema::access_event::table)
                    .values(event)
                    .execute(conn)?;

                Ok(())
            })
        })
        .await??;
        Ok(())
    }
}

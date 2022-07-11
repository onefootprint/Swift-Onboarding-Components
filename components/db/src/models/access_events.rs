use crate::DbPool;
use crate::{schema::access_events, DbError};
use chrono::{DateTime, Utc};
use diesel::{Connection, Insertable, Queryable, RunQueryDsl};
use newtypes::{AccessEventId, DataKind, InsightEventId, OnboardingId};
use serde::{Deserialize, Serialize};

use super::insight_event::CreateInsightEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = access_events)]
pub struct AccessEvent {
    pub id: AccessEventId,
    pub onboarding_id: OnboardingId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub reason: String,
    pub principal: Option<String>,
    pub data_kinds: Vec<DataKind>,
    pub ordering_id: i64,
}

#[derive(Debug, Clone)]
pub struct NewAccessEvent {
    pub onboarding_id: OnboardingId,
    pub data_kinds: Vec<DataKind>,
    pub reason: String,
    pub principal: Option<String>,
    pub insight: CreateInsightEvent,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = access_events)]
struct NewAccessEventWithInsight {
    onboarding_id: OnboardingId,
    data_kinds: Vec<DataKind>,
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
                    onboarding_id: self.onboarding_id,
                    insight_event_id: insight_ev.id,
                    reason: self.reason,
                    principal: self.principal,
                };

                diesel::insert_into(crate::schema::access_events::table)
                    .values(event)
                    .execute(conn)?;

                Ok(())
            })
        })
        .await??;
        Ok(())
    }
}

use crate::schema::access_events;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::{Connection, Insertable, Queryable, RunQueryDsl};
use newtypes::{DataKind, OnboardingId};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::insight_event::CreateInsightEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "access_events"]
pub struct AccessEvent {
    pub id: Uuid,
    pub onboarding_id: OnboardingId,
    pub timestamp: NaiveDateTime,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
    pub insight_event_id: Uuid,
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
#[table_name = "access_events"]
struct NewAccessEventWithInsight {
    onboarding_id: OnboardingId,
    data_kinds: Vec<DataKind>,
    insight_event_id: Uuid,
    reason: String,
    principal: Option<String>,
}

impl NewAccessEvent {
    pub async fn save(self, pool: &DbPool) -> Result<(), crate::DbError> {
        let _ = pool
            .get()
            .await?
            .interact(move |conn| {
                conn.transaction(|| {
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
                        .execute(conn)
                })
            })
            .await??;
        Ok(())
    }
}

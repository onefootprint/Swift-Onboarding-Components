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
    pub data_kind: DataKind,
    pub timestamp: NaiveDateTime,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub insight_event_id: Option<Uuid>,
}

#[derive(Debug, Clone)]
pub struct NewAccessEvent {
    pub onboarding_id: OnboardingId,
    pub data_kind: DataKind,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "access_events"]
struct NewAccessEventWithInsight {
    onboarding_id: OnboardingId,
    data_kind: DataKind,
    insight_event_id: Uuid,
}

pub struct NewAccessEventBatch {
    pub events: Vec<NewAccessEvent>,
    pub insight: CreateInsightEvent,
}

impl NewAccessEventBatch {
    pub async fn bulk_insert(self, pool: &DbPool) -> Result<(), crate::DbError> {
        let _ = pool
            .get()
            .await?
            .interact(move |conn| {
                conn.transaction(|| {
                    let insight_ev = self.insight.insert_with_conn(conn)?;

                    let events = self
                        .events
                        .into_iter()
                        .map(|ev| NewAccessEventWithInsight {
                            data_kind: ev.data_kind,
                            onboarding_id: ev.onboarding_id,
                            insight_event_id: insight_ev.id.clone(),
                        })
                        .collect::<Vec<NewAccessEventWithInsight>>();

                    diesel::insert_into(crate::schema::access_events::table)
                        .values(events)
                        .execute(conn)
                })
            })
            .await??;
        Ok(())
    }
}

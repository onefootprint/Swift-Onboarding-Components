use crate::schema::access_events;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, RunQueryDsl};
use newtypes::{DataKind, OnboardingId};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "access_events"]
pub struct AccessEvent {
    pub id: Uuid,
    pub onboarding_id: OnboardingId,
    pub data_kind: DataKind,
    pub timestamp: NaiveDateTime,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "access_events"]
pub struct NewAccessEvent {
    pub onboarding_id: OnboardingId,
    pub data_kind: DataKind,
}

pub struct NewAccessEventBatch(pub Vec<NewAccessEvent>);

impl NewAccessEventBatch {
    pub async fn bulk_insert(self, pool: &DbPool) -> Result<(), crate::DbError> {
        let _ = pool
            .get()
            .await?
            .interact(move |conn| {
                diesel::insert_into(crate::schema::access_events::table)
                    .values(self.0)
                    .execute(conn)
            })
            .await??;
        Ok(())
    }
}

use crate::{schema::user_timeline, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{OnboardingId, UserTimelineEvent, UserTimelineId, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = user_timeline)]
pub struct UserTimeline {
    pub id: UserTimelineId,
    pub onboarding_id: Option<OnboardingId>,
    pub event: UserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub user_vault_id: UserVaultId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = user_timeline)]
pub struct NewUserTimeline {
    pub user_vault_id: UserVaultId,
    pub onboarding_id: Option<OnboardingId>,
    pub event: UserTimelineEvent,
    pub timestamp: DateTime<Utc>,
}

impl UserTimeline {
    pub fn create<T>(
        conn: &mut PgConnection,
        event: T,
        user_vault_id: UserVaultId,
        onboarding_id: Option<OnboardingId>,
    ) -> DbResult<()>
    where
        T: Into<UserTimelineEvent>,
    {
        let new = NewUserTimeline {
            event: event.into(),
            onboarding_id,
            user_vault_id,
            timestamp: chrono::Utc::now(),
        };
        diesel::insert_into(user_timeline::table)
            .values(new)
            .execute(conn)?;
        Ok(())
    }
}

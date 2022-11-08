use crate::schema::liveness_event;
use crate::schema::onboarding;
use crate::schema::scoped_user;
use crate::DbError;

use chrono::{DateTime, Utc};

use diesel::prelude::*;
use diesel::PgConnection;
use diesel::{Insertable, Queryable};

use newtypes::UserVaultId;
use newtypes::{LivenessEventId, LivenessSource, OnboardingId};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Default)]
#[diesel(table_name = liveness_event)]
pub struct LivenessEvent {
    pub id: LivenessEventId,
    pub onboarding_id: OnboardingId,
    pub liveness_source: LivenessSource,
    pub attributes: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

impl LivenessEvent {
    pub fn get_for_onboarding_id(
        conn: &mut PgConnection,
        onboarding_id: &OnboardingId,
    ) -> Result<Vec<Self>, DbError> {
        Ok(liveness_event::table
            .filter(liveness_event::onboarding_id.eq(onboarding_id))
            .get_results(conn)?)
    }

    pub fn get_by_user_vault_id(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> Result<Vec<Self>, DbError> {
        let scoped_ids = scoped_user::table
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .select(scoped_user::id);

        let results = onboarding::table
            .filter(onboarding::scoped_user_id.eq_any(scoped_ids))
            .inner_join(liveness_event::table)
            .select(liveness_event::all_columns)
            .load(conn)?;
        Ok(results)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Default)]
#[diesel(table_name = liveness_event)]
pub struct NewLivenessEvent {
    pub onboarding_id: OnboardingId,
    pub liveness_source: LivenessSource,
    pub attributes: Option<serde_json::Value>,
}

impl NewLivenessEvent {
    pub fn insert(self, conn: &mut PgConnection) -> Result<LivenessEvent, DbError> {
        let ev = diesel::insert_into(crate::schema::liveness_event::table)
            .values(self)
            .get_result(conn)?;
        Ok(ev)
    }
}

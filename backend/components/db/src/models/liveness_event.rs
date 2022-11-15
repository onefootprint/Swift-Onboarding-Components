use std::collections::HashMap;

use crate::schema;

use crate::schema::liveness_event;
use crate::schema::onboarding;
use crate::schema::scoped_user;
use crate::DbError;
use crate::DbResult;

use chrono::{DateTime, Utc};

use diesel::prelude::*;
use diesel::PgConnection;
use diesel::{Insertable, Queryable};

use newtypes::FootprintUserId;
use newtypes::InsightEventId;
use newtypes::LivenessAttributes;

use newtypes::TenantId;
use newtypes::UserVaultId;
use newtypes::{LivenessEventId, LivenessSource, OnboardingId};

use serde::{Deserialize, Serialize};

use super::insight_event::InsightEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Default)]
#[diesel(table_name = liveness_event)]
pub struct LivenessEvent {
    pub id: LivenessEventId,
    pub onboarding_id: OnboardingId,
    pub liveness_source: LivenessSource,
    pub attributes: Option<LivenessAttributes>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
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
    ) -> Result<Vec<(Self, InsightEvent)>, DbError> {
        let scoped_ids = scoped_user::table
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .select(scoped_user::id);

        let results = onboarding::table
            .filter(onboarding::scoped_user_id.eq_any(scoped_ids))
            .inner_join(liveness_event::table)
            .inner_join(schema::insight_event::table)
            .select((liveness_event::all_columns, schema::insight_event::all_columns))
            .load(conn)?;
        Ok(results)
    }

    pub fn get_for_scoped_user(
        conn: &mut PgConnection,
        footprint_user_id: &FootprintUserId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> Result<Vec<(Self, InsightEvent)>, DbError> {
        let scoped_ids = schema::scoped_user::table
            .filter(schema::scoped_user::tenant_id.eq(tenant_id))
            .filter(schema::scoped_user::fp_user_id.eq(footprint_user_id))
            .filter(schema::scoped_user::is_live.eq(is_live))
            .select(schema::scoped_user::id);

        let results = onboarding::table
            .filter(onboarding::scoped_user_id.eq_any(scoped_ids))
            .inner_join(liveness_event::table)
            .inner_join(schema::insight_event::table)
            .select((liveness_event::all_columns, schema::insight_event::all_columns))
            .load(conn)?;
        Ok(results)
    }

    pub fn get_bulk(
        conn: &mut PgConnection,
        ids: Vec<&LivenessEventId>,
    ) -> DbResult<HashMap<LivenessEventId, (Self, InsightEvent)>> {
        let results = liveness_event::table
            .inner_join(schema::insight_event::table)
            .filter(liveness_event::id.eq_any(ids))
            .get_results::<(Self, InsightEvent)>(conn)?
            .into_iter()
            .map(|e| (e.0.id.clone(), e))
            .collect();

        Ok(results)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Default)]
#[diesel(table_name = liveness_event)]
pub struct NewLivenessEvent {
    pub onboarding_id: OnboardingId,
    pub liveness_source: LivenessSource,
    pub attributes: Option<LivenessAttributes>,
    pub insight_event_id: InsightEventId,
}

impl NewLivenessEvent {
    pub fn insert(self, conn: &mut PgConnection) -> Result<LivenessEvent, DbError> {
        let ev = diesel::insert_into(crate::schema::liveness_event::table)
            .values(self)
            .get_result(conn)?;
        Ok(ev)
    }
}

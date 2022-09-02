use super::insight_event::CreateInsightEvent;
use super::scoped_user::ScopedUser;
use crate::models::insight_event::InsightEvent;
use crate::models::ob_configuration::ObConfiguration;
use crate::schema::{onboarding, scoped_user};
use crate::{DbError, DbPool};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{InsightEventId, ObConfigurationId, OnboardingId, ScopedUserId, Status, UserVaultId};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
pub struct Onboarding {
    pub id: OnboardingId,
    pub scoped_user_id: ScopedUserId,
    pub ob_configuration_id: ObConfigurationId,
    pub start_timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub status: Status,
    pub insight_event_id: InsightEventId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
struct NewOnboarding {
    scoped_user_id: ScopedUserId,
    ob_configuration_id: ObConfigurationId,
    start_timestamp: DateTime<Utc>,
    status: Status,
    insight_event_id: InsightEventId,
}

pub type OnboardingInfo = (Onboarding, ObConfiguration, InsightEvent);

impl Onboarding {
    pub async fn get(pool: &DbPool, id: OnboardingId) -> Result<Option<(Onboarding, ScopedUser)>, DbError> {
        let ob = pool
            .db_query(|conn| -> Result<Option<(Onboarding, ScopedUser)>, DbError> {
                let ob = onboarding::table
                    .inner_join(scoped_user::table)
                    .filter(onboarding::id.eq(id))
                    .first(conn)
                    .optional()?;
                Ok(ob)
            })
            .await??;
        Ok(ob)
    }

    pub fn get_for_scoped_users(
        conn: &mut PgConnection,
        scoped_user_ids: Vec<&ScopedUserId>,
    ) -> Result<HashMap<ScopedUserId, Vec<OnboardingInfo>>, DbError> {
        use crate::schema::{insight_event, ob_configuration};
        let obs: Vec<OnboardingInfo> = onboarding::table
            .inner_join(ob_configuration::table)
            .inner_join(insight_event::table)
            .filter(onboarding::scoped_user_id.eq_any(scoped_user_ids))
            .order_by(onboarding::scoped_user_id)
            .load(conn)?;

        // Turn the Vec of OnboardingInfo into a hashmap of OnboadringId -> Vec<OnboardingInfo>
        // group_by only groups adjacent items, so this requires that the vec is sorted by scoped_user_id
        let result = obs
            .into_iter()
            .group_by(|(link, _, _)| link.scoped_user_id.clone())
            .into_iter()
            .map(|g| (g.0, g.1.collect()))
            .collect();
        Ok(result)
    }

    pub fn get_by_config(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
        ob_configuration_id: &ObConfigurationId,
    ) -> Result<Option<Onboarding>, DbError> {
        let onboarding = onboarding::table
            .inner_join(scoped_user::table)
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .filter(onboarding::ob_configuration_id.eq(ob_configuration_id))
            .select(onboarding::all_columns)
            .first(conn)
            .optional()?;
        Ok(onboarding)
    }

    pub fn get_or_create(
        conn: &mut PgConnection,
        scoped_user_id: ScopedUserId,
        ob_configuration_id: ObConfigurationId,
        insight_event: CreateInsightEvent,
    ) -> Result<Onboarding, DbError> {
        let ob = onboarding::table
            .filter(onboarding::scoped_user_id.eq(&scoped_user_id))
            .filter(onboarding::ob_configuration_id.eq(&ob_configuration_id))
            .first(conn)
            .optional()?;
        if let Some(ob) = ob {
            return Ok(ob);
        }
        // Row doesn't exist for scoped_user_id, ob_configuration_id - create a new one
        let insight_event = insight_event.insert_with_conn(conn)?;
        let new_ob = NewOnboarding {
            scoped_user_id,
            ob_configuration_id,
            start_timestamp: Utc::now(),
            status: Status::Processing,
            insight_event_id: insight_event.id,
        };
        let ob = diesel::insert_into(onboarding::table)
            .values(new_ob)
            .get_result::<Onboarding>(conn)?;
        Ok(ob)
    }

    pub fn update_status(self, conn: &mut PgConnection, new_status: Status) -> Result<(), DbError> {
        Self::update_status_by_id(conn, &self.id, new_status)
    }

    pub fn update_status_by_id(
        conn: &mut PgConnection,
        id: &OnboardingId,
        new_status: Status,
    ) -> Result<(), DbError> {
        // Intentionally consume the value so the stale version is not used
        diesel::update(onboarding::table)
            .filter(onboarding::id.eq(id))
            .set(onboarding::status.eq(new_status))
            .execute(conn)?;
        Ok(())
    }
}

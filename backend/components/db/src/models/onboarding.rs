use super::insight_event::CreateInsightEvent;
use super::scoped_user::ScopedUser;
use crate::models::insight_event::InsightEvent;
use crate::models::ob_configuration::ObConfiguration;
use crate::schema::{onboarding, scoped_user};
use crate::{assert_in_transaction, DbError, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{InsightEventId, KycStatus, ObConfigurationId, OnboardingId, ScopedUserId, UserVaultId};
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
    pub insight_event_id: InsightEventId,
    pub kyc_status: KycStatus,
    pub is_liveness_skipped: bool,
    pub is_authorized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
struct NewOnboarding {
    scoped_user_id: ScopedUserId,
    ob_configuration_id: ObConfigurationId,
    start_timestamp: DateTime<Utc>,
    insight_event_id: InsightEventId,
    kyc_status: KycStatus,
    is_liveness_skipped: bool,
    is_authorized: bool,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = onboarding)]
pub struct OnboardingUpdate {
    pub kyc_status: Option<KycStatus>,
    pub is_liveness_skipped: Option<bool>,
    pub is_authorized: Option<bool>,
}

impl OnboardingUpdate {
    pub fn kyc_status(status: KycStatus) -> Self {
        Self {
            kyc_status: Some(status),
            ..Self::default()
        }
    }

    pub fn is_liveness_skipped(is_liveness_skipped: bool) -> Self {
        Self {
            is_liveness_skipped: Some(is_liveness_skipped),
            ..Self::default()
        }
    }

    pub fn is_authorized(is_authorized: bool) -> Self {
        Self {
            is_authorized: Some(is_authorized),
            ..Self::default()
        }
    }
}

pub type OnboardingInfo = (Onboarding, ObConfiguration, InsightEvent);

impl Onboarding {
    pub fn get(conn: &mut PgConnection, id: &OnboardingId) -> Result<(Onboarding, ScopedUser), DbError> {
        let ob = onboarding::table
            .inner_join(scoped_user::table)
            .filter(onboarding::id.eq(id))
            .first(conn)?;
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

    pub fn lock_by_config(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
        ob_configuration_id: &ObConfigurationId,
    ) -> Result<Option<(Onboarding, ScopedUser)>, DbError> {
        assert_in_transaction(conn)?;
        let result = onboarding::table
            .inner_join(scoped_user::table)
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .filter(onboarding::ob_configuration_id.eq(ob_configuration_id))
            .for_no_key_update()
            .first(conn)
            .optional()?;
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
            insight_event_id: insight_event.id,
            kyc_status: KycStatus::New,
            is_liveness_skipped: false,
            is_authorized: false,
        };
        let ob = diesel::insert_into(onboarding::table)
            .values(new_ob)
            .get_result::<Onboarding>(conn)?;
        Ok(ob)
    }

    pub fn update(self, conn: &mut PgConnection, update: OnboardingUpdate) -> DbResult<Self> {
        // Intentionally consume the value so the stale version is not used
        let result = Self::update_by_id(conn, &self.id, update)?;
        Ok(result)
    }

    pub fn update_by_id(
        conn: &mut PgConnection,
        id: &OnboardingId,
        update: OnboardingUpdate,
    ) -> DbResult<Self> {
        // Intentionally consume the value so the stale version is not used
        let result = diesel::update(onboarding::table)
            .filter(onboarding::id.eq(id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }
}

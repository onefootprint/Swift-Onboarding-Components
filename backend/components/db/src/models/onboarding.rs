use super::insight_event::CreateInsightEvent;
use super::liveness_event::LivenessEvent;
use super::onboarding_decision::OnboardingDecision;
use super::scoped_user::ScopedUser;
use super::tenant_user::TenantUser;
use crate::models::insight_event::InsightEvent;
use crate::models::ob_configuration::ObConfiguration;
use crate::schema::{onboarding, scoped_user};
use crate::{DbResult, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    InsightEventId, ObConfigurationId, OnboardingId, OnboardingStatus, ScopedUserId, TenantId, UserVaultId,
};
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
    pub status: OnboardingStatus,
    pub is_authorized: bool,
    pub idv_reqs_initiated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
struct NewOnboarding {
    scoped_user_id: ScopedUserId,
    ob_configuration_id: ObConfigurationId,
    start_timestamp: DateTime<Utc>,
    insight_event_id: InsightEventId,
    status: OnboardingStatus,
    is_authorized: bool,
    idv_reqs_initiated: bool,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = onboarding)]
pub struct OnboardingUpdate {
    pub status: Option<OnboardingStatus>,
    pub is_authorized: Option<bool>,
    pub idv_reqs_initiated: Option<bool>,
}

impl OnboardingUpdate {
    pub fn status(status: OnboardingStatus) -> Self {
        Self {
            status: Some(status),
            ..Self::default()
        }
    }

    pub fn is_authorized(is_authorized: bool) -> Self {
        Self {
            is_authorized: Some(is_authorized),
            ..Self::default()
        }
    }

    pub fn idv_reqs_initiated(idv_reqs_initiated: bool) -> Self {
        Self {
            idv_reqs_initiated: Some(idv_reqs_initiated),
            ..Self::default()
        }
    }
}

#[derive(Debug)]
pub enum OnboardingIdentifier<'a> {
    Id(&'a OnboardingId),
    TenantId {
        id: &'a OnboardingId,
        tenant_id: &'a TenantId,
    },
    UserId {
        id: &'a OnboardingId,
        user_vault_id: &'a UserVaultId,
    },
    ConfigId {
        user_vault_id: &'a UserVaultId,
        ob_config_id: &'a ObConfigurationId,
    },
}

impl<'a> From<&'a OnboardingId> for OnboardingIdentifier<'a> {
    fn from(id: &'a OnboardingId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<(&'a OnboardingId, &'a TenantId)> for OnboardingIdentifier<'a> {
    fn from((id, tenant_id): (&'a OnboardingId, &'a TenantId)) -> Self {
        Self::TenantId { id, tenant_id }
    }
}

impl<'a> From<(&'a OnboardingId, &'a UserVaultId)> for OnboardingIdentifier<'a> {
    fn from((id, user_vault_id): (&'a OnboardingId, &'a UserVaultId)) -> Self {
        Self::UserId { id, user_vault_id }
    }
}

impl<'a> From<(&'a UserVaultId, &'a ObConfigurationId)> for OnboardingIdentifier<'a> {
    fn from((user_vault_id, ob_config_id): (&'a UserVaultId, &'a ObConfigurationId)) -> Self {
        Self::ConfigId {
            user_vault_id,
            ob_config_id,
        }
    }
}

pub type OnboardingInfo = (
    Onboarding,
    ObConfiguration,
    Option<LivenessEvent>,
    InsightEvent,
    Option<(OnboardingDecision, Option<TenantUser>)>,
);

impl Onboarding {
    pub fn get<'a, T>(conn: &'a mut PgConnection, id: T) -> DbResult<(Onboarding, ScopedUser)>
    where
        T: Into<OnboardingIdentifier<'a>>,
    {
        let mut query = onboarding::table.inner_join(scoped_user::table).into_boxed();

        match id.into() {
            OnboardingIdentifier::Id(id) => query = query.filter(onboarding::id.eq(id)),
            OnboardingIdentifier::TenantId { id, tenant_id } => {
                query = query
                    .filter(onboarding::id.eq(id))
                    .filter(scoped_user::tenant_id.eq(tenant_id))
            }
            OnboardingIdentifier::UserId { id, user_vault_id } => {
                query = query
                    .filter(onboarding::id.eq(id))
                    .filter(scoped_user::user_vault_id.eq(user_vault_id))
            }
            OnboardingIdentifier::ConfigId {
                user_vault_id,
                ob_config_id,
            } => {
                query = query
                    .filter(scoped_user::user_vault_id.eq(user_vault_id))
                    .filter(onboarding::ob_configuration_id.eq(ob_config_id))
            }
        }

        let result = query.first(conn)?;

        Ok(result)
    }

    // TODO generify lock functions to use OnboardingIdentifier.
    // It is difficult because we can't call .for_update() on boxed queries
    pub fn lock_by_config(
        conn: &mut TxnPgConnection,
        user_vault_id: &UserVaultId,
        ob_configuration_id: &ObConfigurationId,
    ) -> DbResult<Option<(Onboarding, ScopedUser)>> {
        let result = onboarding::table
            .inner_join(scoped_user::table)
            .filter(scoped_user::user_vault_id.eq(user_vault_id))
            .filter(onboarding::ob_configuration_id.eq(ob_configuration_id))
            .for_no_key_update()
            .first(conn.conn())
            .optional()?;
        Ok(result)
    }

    pub fn lock(conn: &mut TxnPgConnection, id: &OnboardingId) -> DbResult<Self> {
        let result = onboarding::table
            .filter(onboarding::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(result)
    }

    pub fn get_for_scoped_users(
        conn: &mut PgConnection,
        scoped_user_ids: Vec<&ScopedUserId>,
    ) -> DbResult<HashMap<ScopedUserId, Vec<OnboardingInfo>>> {
        use crate::schema::{
            insight_event, liveness_event, ob_configuration, onboarding_decision, tenant_user,
        };
        let obs: Vec<OnboardingInfo> = onboarding::table
            .inner_join(ob_configuration::table)
            // TODO return all liveness events
            .left_join(liveness_event::table)
            .inner_join(insight_event::table)
            // Get the active decision and its tenant_user, if any
            .left_join(
                onboarding_decision::table.left_join(tenant_user::table)
            )
            .filter(onboarding::scoped_user_id.eq_any(scoped_user_ids))
            .filter(onboarding_decision::deactivated_at.is_null())
            .order_by(onboarding::scoped_user_id)
            .load(conn)?;

        // Turn the Vec of OnboardingInfo into a hashmap of OnboadringId -> Vec<OnboardingInfo>
        // group_by only groups adjacent items, so this requires that the vec is sorted by scoped_user_id
        let result = obs
            .into_iter()
            .group_by(|(link, _, _, _, _)| link.scoped_user_id.clone())
            .into_iter()
            .map(|g| (g.0, g.1.collect()))
            .collect();
        Ok(result)
    }

    pub fn get_or_create(
        conn: &mut PgConnection,
        scoped_user_id: ScopedUserId,
        ob_configuration_id: ObConfigurationId,
        insight_event: CreateInsightEvent,
    ) -> DbResult<Onboarding> {
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
            status: OnboardingStatus::Processing,
            is_authorized: false,
            idv_reqs_initiated: false,
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

use super::insight_event::CreateInsightEvent;
use super::tenants::Tenant;
use crate::models::insight_event::InsightEvent;
use crate::models::ob_configurations::ObConfiguration;
use crate::schema::{onboardings, scoped_users};
use crate::{DbError, DbPool};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    FootprintUserId, InsightEventId, ObConfigurationId, OnboardingId, ScopedUserId, Status, TenantId,
    UserVaultId,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = scoped_users)]
pub struct ScopedUser {
    pub id: ScopedUserId,
    pub fp_user_id: FootprintUserId,
    pub user_vault_id: UserVaultId,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub ordering_id: i64,
    pub start_timestamp: DateTime<Utc>,
    pub is_live: bool,
    pub insight_event_id: InsightEventId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboardings)]
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
#[diesel(table_name = onboardings)]
struct NewOnboarding {
    scoped_user_id: ScopedUserId,
    ob_configuration_id: ObConfigurationId,
    start_timestamp: DateTime<Utc>,
    status: Status,
    insight_event_id: InsightEventId,
}

pub type OnboardingInfo = (Onboarding, ObConfiguration, InsightEvent);

impl Onboarding {
    pub async fn get_by_id(
        pool: &DbPool,
        id: OnboardingId,
    ) -> Result<Option<(Onboarding, ScopedUser)>, DbError> {
        let ob = pool
            .db_query(|conn| -> Result<Option<(Onboarding, ScopedUser)>, DbError> {
                let ob = onboardings::table
                    .inner_join(scoped_users::table)
                    .filter(onboardings::id.eq(id))
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
        use crate::schema::{insight_events, ob_configurations};
        let obs: Vec<OnboardingInfo> = onboardings::table
            .inner_join(ob_configurations::table)
            .inner_join(insight_events::table)
            .filter(onboardings::scoped_user_id.eq_any(scoped_user_ids))
            .order_by(onboardings::scoped_user_id)
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

    pub fn get_or_create(
        conn: &mut PgConnection,
        scoped_user_id: ScopedUserId,
        ob_configuration_id: ObConfigurationId,
        insight_event: CreateInsightEvent,
    ) -> Result<Onboarding, DbError> {
        let ob = onboardings::table
            .filter(onboardings::scoped_user_id.eq(&scoped_user_id))
            .filter(onboardings::ob_configuration_id.eq(&ob_configuration_id))
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
        let ob = diesel::insert_into(onboardings::table)
            .values(new_ob)
            .get_result::<Onboarding>(conn)?;
        Ok(ob)
    }

    pub fn update_status(&self, conn: &mut PgConnection, new_status: Status) -> Result<(), DbError> {
        diesel::update(onboardings::table)
            .filter(onboardings::id.eq(&self.id))
            .set(onboardings::status.eq(new_status))
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = scoped_users)]
struct NewScopedUser {
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    insight_event_id: InsightEventId,
    start_timestamp: DateTime<Utc>,
    is_live: bool,
}

impl ScopedUser {
    pub fn get_or_create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        insight_event: CreateInsightEvent,
        is_live: bool,
    ) -> Result<ScopedUser, DbError> {
        let scoped_user = scoped_users::table
            .filter(scoped_users::user_vault_id.eq(&user_vault_id))
            .filter(scoped_users::tenant_id.eq(&tenant_id))
            .first(conn)
            .optional()?;
        if let Some(scoped_user) = scoped_user {
            return Ok(scoped_user);
        }
        // Row doesn't exist for user_vault_id, tenant_id - create a new one
        let insight_event = insight_event.insert_with_conn(conn)?;
        let new = NewScopedUser {
            user_vault_id,
            tenant_id,
            insight_event_id: insight_event.id,
            start_timestamp: Utc::now(),
            is_live,
        };
        let ob = diesel::insert_into(scoped_users::table)
            .values(new)
            .get_result::<ScopedUser>(conn)?;
        Ok(ob)
    }

    /// get scoped_users by a specific user vault
    pub fn list_for_user_vault(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> Result<Vec<(ScopedUser, Tenant)>, DbError> {
        use crate::schema::tenants;
        let results = scoped_users::table
            .inner_join(tenants::table)
            .filter(scoped_users::user_vault_id.eq(user_vault_id))
            .get_results(conn)?;
        Ok(results)
    }

    pub async fn get_for_tenant(
        pool: &DbPool,
        tenant_id: TenantId,
        user_vault_id: UserVaultId,
    ) -> Result<Option<ScopedUser>, DbError> {
        let ob = pool
            .db_query(|conn| -> Result<Option<ScopedUser>, DbError> {
                let ob = scoped_users::table
                    .filter(scoped_users::tenant_id.eq(tenant_id))
                    .filter(scoped_users::user_vault_id.eq(user_vault_id))
                    .first(conn)
                    .optional()?;
                Ok(ob)
            })
            .await??;
        Ok(ob)
    }
}

use super::tenants::Tenant;
use crate::models::insight_event::InsightEvent;
use crate::models::ob_configurations::ObConfiguration;
use crate::schema::{onboarding_links, onboardings};
use crate::{DbError, DbPool};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    FootprintUserId, InsightEventId, ObConfigurationId, OnboardingId, OnboardingLinkId, Status, TenantId,
    UserVaultId,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboardings)]
pub struct Onboarding {
    pub id: OnboardingId,
    pub user_ob_id: FootprintUserId,
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
#[diesel(table_name = onboarding_links)]
pub struct OnboardingLink {
    pub id: OnboardingLinkId,
    pub onboarding_id: OnboardingId,
    pub ob_configuration_id: ObConfigurationId,
    pub start_timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub status: Status,
    pub insight_event_id: InsightEventId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding_links)]
struct NewOnboardingLink {
    onboarding_id: OnboardingId,
    ob_configuration_id: ObConfigurationId,
    start_timestamp: DateTime<Utc>,
    status: Status,
    insight_event_id: InsightEventId,
}

pub type OnboardingLinkInfo = (OnboardingLink, ObConfiguration, InsightEvent);

impl OnboardingLink {
    pub async fn get_by_id(
        pool: &DbPool,
        id: OnboardingLinkId,
    ) -> Result<Option<(OnboardingLink, Onboarding)>, DbError> {
        let ob = pool
            .db_query(|conn| -> Result<Option<(OnboardingLink, Onboarding)>, DbError> {
                let ob = onboarding_links::table
                    .inner_join(onboardings::table)
                    .filter(onboarding_links::id.eq(id))
                    .first(conn)
                    .optional()?;
                Ok(ob)
            })
            .await??;
        Ok(ob)
    }

    pub fn get_for_onboardings(
        conn: &mut PgConnection,
        onboarding_ids: Vec<&OnboardingId>,
    ) -> Result<HashMap<OnboardingId, Vec<OnboardingLinkInfo>>, DbError> {
        use crate::schema::{insight_events, ob_configurations};
        let ob_links: Vec<OnboardingLinkInfo> = onboarding_links::table
            .inner_join(ob_configurations::table)
            .inner_join(insight_events::table)
            .filter(onboarding_links::onboarding_id.eq_any(onboarding_ids))
            .order_by(onboarding_links::onboarding_id)
            .load(conn)?;

        // Turn the Vec of OnboardingLinkInfo into a hashmap of OnboadringId -> Vec<OnboardingLinkInfo>
        // group_by only groups adjacent items, so this requires that the vec is sorted by onboarding_id
        let result = ob_links
            .into_iter()
            .group_by(|(link, _, _)| link.onboarding_id.clone())
            .into_iter()
            .map(|g| (g.0, g.1.collect()))
            .collect();
        Ok(result)
    }

    pub fn get_or_create(
        conn: &mut PgConnection,
        onboarding_id: OnboardingId,
        ob_configuration_id: ObConfigurationId,
        insight_event_id: InsightEventId,
    ) -> Result<OnboardingLink, DbError> {
        let new_ob_link = NewOnboardingLink {
            onboarding_id,
            ob_configuration_id,
            start_timestamp: Utc::now(),
            status: Status::Processing,
            insight_event_id,
        };
        let ob_link = diesel::insert_into(onboarding_links::table)
            .values(new_ob_link)
            .on_conflict((
                onboarding_links::onboarding_id,
                onboarding_links::ob_configuration_id,
            ))
            .do_nothing()
            .get_result::<OnboardingLink>(conn)?;
        Ok(ob_link)
    }

    pub fn update_status(&self, conn: &mut PgConnection, new_status: Status) -> Result<(), DbError> {
        diesel::update(onboarding_links::table)
            .filter(onboarding_links::id.eq(&self.id))
            .set(onboarding_links::status.eq(new_status))
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = onboardings)]
struct NewOnboarding {
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    insight_event_id: InsightEventId,
    start_timestamp: DateTime<Utc>,
    is_live: bool,
}

impl Onboarding {
    pub fn get_or_create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        insight_event_id: InsightEventId,
        is_live: bool,
    ) -> Result<Onboarding, DbError> {
        let new = NewOnboarding {
            user_vault_id,
            tenant_id,
            insight_event_id,
            start_timestamp: Utc::now(),
            is_live,
        };
        let ob = diesel::insert_into(onboardings::table)
            .values(new)
            .on_conflict((onboardings::user_vault_id, onboardings::tenant_id))
            .do_nothing()
            .get_result::<Onboarding>(conn)?;
        Ok(ob)
    }

    /// get onboardings by a specific user vault
    pub fn list_for_user_vault(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> Result<Vec<(Onboarding, Tenant)>, DbError> {
        use crate::schema::tenants;
        let results = onboardings::table
            .inner_join(tenants::table)
            .filter(onboardings::user_vault_id.eq(user_vault_id))
            .get_results(conn)?;
        Ok(results)
    }

    pub async fn get_for_tenant(
        pool: &DbPool,
        tenant_id: TenantId,
        user_vault_id: UserVaultId,
    ) -> Result<Option<Onboarding>, DbError> {
        let ob = pool
            .db_query(|conn| -> Result<Option<Onboarding>, DbError> {
                let ob = onboardings::table
                    .filter(onboardings::tenant_id.eq(tenant_id))
                    .filter(onboardings::user_vault_id.eq(user_vault_id))
                    .first(conn)
                    .optional()?;
                Ok(ob)
            })
            .await??;
        Ok(ob)
    }
}

use crate::schema::{onboarding_links, onboardings};
use crate::{DbError, DbPool};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    FootprintUserId, InsightEventId, ObConfigurationId, OnboardingId, OnboardingLinkId, Status, TenantId,
    UserVaultId,
};
use serde::{Deserialize, Serialize};

use super::insight_event::CreateInsightEvent;

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
pub struct NewOnboardingLink {
    pub onboarding_id: OnboardingId,
    pub ob_configuration_id: ObConfigurationId,
    pub start_timestamp: DateTime<Utc>,
    pub status: Status,
    pub insight_event_id: InsightEventId,
}

impl OnboardingLink {
    pub async fn get(
        pool: &DbPool,
        id: ObConfigurationId,
        user_vault_id: UserVaultId,
    ) -> Result<Option<(OnboardingLink, Onboarding)>, DbError> {
        let ob = pool
            .db_query(|conn| -> Result<Option<(OnboardingLink, Onboarding)>, DbError> {
                let ob = onboarding_links::table
                    .inner_join(onboardings::table)
                    .filter(onboarding_links::ob_configuration_id.eq(id))
                    .filter(onboardings::user_vault_id.eq(user_vault_id))
                    .first(conn)
                    .optional()?;
                Ok(ob)
            })
            .await??;
        Ok(ob)
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
pub struct NewOnboarding {
    pub user_vault_id: UserVaultId,
    pub tenant_id: TenantId,
    pub start_timestamp: DateTime<Utc>,
    pub is_live: bool,
}

impl NewOnboarding {
    pub async fn get_or_create(
        pool: &DbPool,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        ob_config_id: ObConfigurationId,
        status: Status,
        insight_event: CreateInsightEvent,
        is_live: bool,
    ) -> Result<Onboarding, DbError> {
        let onboarding = pool
            .db_transaction(move |conn| -> Result<Onboarding, DbError> {
                let existing_ob = onboardings::table
                    // Check to see if the user already has any enabled onboarding for this tenant
                    .inner_join(onboarding_links::table)
                    .filter(onboardings::user_vault_id.eq(&user_vault_id))
                    .filter(onboarding_links::ob_configuration_id.eq(&ob_config_id))
                    .select(onboardings::all_columns)
                    .first(conn)
                    .optional()?;
                match existing_ob {
                    Some(ob) => Ok(ob),
                    None => {
                        let insight_event = insight_event.insert_with_conn(conn)?;

                        let new = NewOnboarding {
                            user_vault_id,
                            tenant_id,
                            start_timestamp: Utc::now(),
                            is_live,
                        };
                        let new_ob = diesel::insert_into(onboardings::table)
                            .values(new)
                            .get_result::<Onboarding>(conn)?;
                        let new_ob_link = NewOnboardingLink {
                            onboarding_id: new_ob.id.clone(),
                            ob_configuration_id: ob_config_id,
                            start_timestamp: Utc::now(),
                            status,
                            insight_event_id: insight_event.id,
                        };
                        diesel::insert_into(onboarding_links::table)
                            .values(new_ob_link)
                            .execute(conn)?;

                        Ok(new_ob)
                    }
                }
            })
            .await?;
        Ok(onboarding)
    }
}

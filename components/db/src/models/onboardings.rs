use crate::schema::{ob_configurations, onboardings};
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    FootprintUserId, InsightEventId, ObConfigurationId, OnboardingId, Status, TenantId, UserVaultId,
};
use serde::{Deserialize, Serialize};

use super::insight_event::CreateInsightEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboardings)]
pub struct Onboarding {
    pub id: OnboardingId,
    pub user_ob_id: FootprintUserId,
    pub user_vault_id: UserVaultId,
    pub ob_config_id: ObConfigurationId,
    pub tenant_id: TenantId,
    pub status: Status,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
    pub insight_event_id: InsightEventId,
    pub ordering_id: i64,
    pub start_timestamp: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = onboardings)]
pub struct NewOnboarding {
    pub user_vault_id: UserVaultId,
    pub ob_config_id: ObConfigurationId,
    pub tenant_id: TenantId,
    pub status: Status,
    pub insight_event_id: InsightEventId,
    pub start_timestamp: NaiveDateTime,
}

impl NewOnboarding {
    pub async fn get_or_create(
        pool: &DbPool,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        ob_config_id: ObConfigurationId,
        status: Status,
        insight_event: CreateInsightEvent,
    ) -> Result<Onboarding, crate::DbError> {
        let onboarding = pool
            .db_query(move |conn| -> Result<Onboarding, crate::DbError> {
                let existing_ob = onboardings::table
                    // Check to see if the user already has any enabled onboarding for this tenant
                    .filter(onboardings::user_vault_id.eq(&user_vault_id))
                    .filter(onboardings::ob_config_id.eq(&ob_config_id))
                    .filter(onboardings::tenant_id.eq(&tenant_id))
                    .left_join(ob_configurations::table)
                    .filter(ob_configurations::is_disabled.eq(false))
                    .select(onboardings::all_columns)
                    .first(conn)
                    .optional()?;
                match existing_ob {
                    Some(ob) => Ok(ob),
                    None => conn.transaction(|conn| {
                        let insight_event = insight_event.insert_with_conn(conn)?;

                        let new = NewOnboarding {
                            user_vault_id,
                            ob_config_id,
                            tenant_id,
                            status,
                            insight_event_id: insight_event.id,
                            start_timestamp: chrono::Utc::now().naive_utc(),
                        };

                        let new_ob = diesel::insert_into(onboardings::table)
                            .values(new)
                            .get_result::<Onboarding>(conn)?;

                        Ok(new_ob)
                    }),
                }
            })
            .await??;
        Ok(onboarding)
    }
}

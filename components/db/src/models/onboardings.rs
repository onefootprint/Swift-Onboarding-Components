use crate::schema::onboardings;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{FootprintUserId, OnboardingId, Status, TenantId, UserVaultId};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::insight_event::CreateInsightEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "onboardings"]
pub struct Onboarding {
    pub id: OnboardingId,
    pub user_ob_id: FootprintUserId,
    pub user_vault_id: UserVaultId,
    pub tenant_id: TenantId,
    pub status: Status,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub start_insight_event_id: Option<Uuid>,
    pub liveness_insight_event_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "onboardings"]
pub struct NewOnboarding {
    pub user_vault_id: UserVaultId,
    pub tenant_id: TenantId,
    pub status: Status,
    pub start_insight_event_id: Option<Uuid>,
}

impl NewOnboarding {
    pub async fn get_or_create(
        pool: &DbPool,
        user_vault_id: UserVaultId,
        tenant_id: TenantId,
        status: Status,
        insight_event: CreateInsightEvent,
    ) -> Result<Onboarding, crate::DbError> {
        let onboarding = pool
            .get()
            .await?
            .interact(move |conn| -> Result<Onboarding, crate::DbError> {
                let existing_ob = onboardings::table
                    .filter(onboardings::tenant_id.eq(&tenant_id))
                    .filter(onboardings::user_vault_id.eq(&user_vault_id))
                    .first(conn)
                    .optional()?;
                match existing_ob {
                    Some(ob) => Ok(ob),
                    None => conn.transaction(|| {
                        let insight_event = insight_event.insert_with_conn(conn)?;

                        let new = NewOnboarding {
                            user_vault_id,
                            tenant_id,
                            status,
                            start_insight_event_id: Some(insight_event.id),
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

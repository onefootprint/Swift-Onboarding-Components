use crate::schema::onboardings;
use crate::{models::types::Status, DbPool};
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "onboardings"]
pub struct Onboarding {
    pub id: String,
    pub user_ob_id: String,
    pub user_vault_id: String,
    pub tenant_id: String,
    pub status: Status,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "onboardings"]
pub struct NewOnboarding {
    pub user_vault_id: String,
    pub tenant_id: String,
    pub status: Status,
}

impl NewOnboarding {
    pub async fn get_or_create(self, pool: &DbPool) -> Result<Onboarding, crate::DbError> {
        let onboarding = pool
            .get()
            .await?
            .interact(move |conn| -> Result<Onboarding, crate::DbError> {
                let existing_ob = onboardings::table
                    .filter(onboardings::tenant_id.eq(&self.tenant_id))
                    .filter(onboardings::user_vault_id.eq(&self.user_vault_id))
                    .first(conn)
                    .optional()?;
                match existing_ob {
                    Some(ob) => Ok(ob),
                    None => {
                        let new_ob = diesel::insert_into(onboardings::table)
                            .values(self)
                            .get_result::<Onboarding>(conn)?;
                        Ok(new_ob)
                    }
                }
            })
            .await??;
        Ok(onboarding)
    }
}

use crate::schema::onboardings;
use crate::models::types::Status;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use chrono::{NaiveDateTime};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "onboardings"]
pub struct Onboarding {
    pub id: String,
    pub user_ob_id: String,
    pub user_vault_id: String,
    pub tenant_id: String,
    pub status: Status,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "onboardings"]
pub struct NewOnboarding {
    pub user_vault_id: String,
    pub tenant_id: String,
    pub status: Status
}

use crate::schema::onboardings;
use crate::models::types::Status;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "onboardings"]
pub struct Onboarding {
    pub id: String,
    pub tenant_id: String,
    pub user_vault_id: String,
    pub footprint_user_id: String,
    pub status: Status
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "onboardings"]
pub struct NewOnboarding {
    pub tenant_id: String,
    pub user_vault_id: String,
    pub status: Status
}

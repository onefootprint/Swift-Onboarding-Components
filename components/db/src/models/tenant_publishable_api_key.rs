use crate::schema::tenant_publishable_api_key;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "tenant_publishable_api_key"]
pub struct UserTenantVerification {
    pub tenant_id: Uuid,
    pub name: String,
    pub api_key: String,
    pub api_key_hash: Vec<u8>,
    pub is_enabled: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "tenant_publishable_api_key"]
pub struct NewUserTenantVerification {
    pub name: String,
    pub api_key: String,
    pub api_key_hash: Vec<u8>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

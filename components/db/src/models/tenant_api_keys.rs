use crate::schema::tenant_api_keys;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "tenant_api_keys"]
pub struct TenantApiKey {
    pub api_key_id: String,
    pub tenant_id: String,
    pub name: String,
    pub sh_api_key: Vec<u8>,
    pub is_enabled: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "tenant_api_keys"]
pub struct NewTenantApiKey {
    pub tenant_id: String,
    pub name: String,
    pub sh_api_key: Vec<u8>,
    pub is_enabled: bool,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,  
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "tenant_api_keys"]
pub struct PartialTenantApiKey {
    pub tenant_id: String,
    pub name: String,
}

use crate::schema::tenant_api_keys;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use newtypes::{TenantApiKeyId, TenantId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "tenant_api_keys"]
pub struct TenantApiKey {
    pub id: TenantApiKeyId,
    pub sh_secret_api_key: Vec<u8>,
    pub e_secret_api_key: Vec<u8>,
    pub tenant_id: TenantId,
    pub key_name: String,
    pub is_enabled: bool,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "tenant_api_keys"]
pub struct NewTenantApiKey {
    pub sh_secret_api_key: Vec<u8>,
    pub e_secret_api_key: Vec<u8>,
    pub tenant_id: TenantId,
    pub key_name: String,
    pub is_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "tenant_api_keys"]
pub struct PartialTenantApiKey {
    pub tenant_id: TenantId,
    pub key_name: String,
}

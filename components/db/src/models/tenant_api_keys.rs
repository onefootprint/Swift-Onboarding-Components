use crate::schema::tenant_api_keys;
use chrono::{DateTime, Utc};
use diesel::{Insertable, Queryable};
use newtypes::{TenantApiKeyId, TenantId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_keys)]
pub struct TenantApiKey {
    pub id: TenantApiKeyId,
    pub sh_secret_api_key: Vec<u8>,
    pub e_secret_api_key: Vec<u8>,
    pub tenant_id: TenantId,
    pub key_name: String,
    pub is_enabled: bool,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = tenant_api_keys)]
pub struct NewTenantApiKey {
    pub sh_secret_api_key: Vec<u8>,
    pub e_secret_api_key: Vec<u8>,
    pub tenant_id: TenantId,
    pub key_name: String,
    pub is_enabled: bool,
    pub is_live: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = tenant_api_keys)]
pub struct PartialTenantApiKey {
    pub tenant_id: TenantId,
    pub key_name: String,
    pub is_live: bool,
}

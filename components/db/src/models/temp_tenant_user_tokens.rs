use crate::schema::temp_tenant_user_tokens;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "temp_tenant_user_tokens"]
pub struct TempTenantUserToken {
    pub h_token: String,
    pub timestamp: NaiveDateTime,
    pub user_id: String,
    pub tenant_id: String,
    pub tenant_user_id: String
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "temp_tenant_user_tokens"]
pub struct NewTempTenantUserToken {
    pub h_token: String,
    pub user_id: String,
    pub tenant_id: String,
    pub tenant_user_id: String
}
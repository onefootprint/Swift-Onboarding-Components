use crate::schema::user_tenant_verifications;
use crate::models::types::Status;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "user_tenant_verifications"]
pub struct UserTenantVerification {
    pub tenant_user_id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub status: Status
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "user_tenant_verifications"]
pub struct NewUserTenantVerification {
    pub tenant_id: String,
    pub user_id: String,
    pub status: Status
}

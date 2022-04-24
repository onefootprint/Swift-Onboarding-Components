use crate::schema::user_tenant_verification;
use crate::models::types::Status;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "user_tenant_verification"]
pub struct UserTenantVerification {
    pub verification_id: Uuid,
    pub tenant_id: Uuid,
    pub user_id: Uuid,
    pub status: Status
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "user_tenant_verification"]
pub struct NewUserTenantVerification {
    pub tenant_id: Uuid,
    pub user_id: Uuid,
    pub status: Status
}

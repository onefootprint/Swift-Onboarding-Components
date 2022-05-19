use crate::schema::tenants;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use newtypes::TenantId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "tenants"]
pub struct Tenant {
    pub id: TenantId,
    pub name: String,
    pub public_key: Vec<u8>,
    pub e_private_key: Vec<u8>,
    pub workos_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "tenants"]
pub struct NewTenant {
    pub name: String,
    pub public_key: Vec<u8>,
    pub e_private_key: Vec<u8>,
    pub workos_id: String,
}

use crate::schema::tenants;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "tenants"]
pub struct Tenant {
    pub id: String,
    pub name: String,
    pub public_key: Vec<u8>,
    pub e_private_key: Vec<u8>
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "tenants"]
pub struct NewTenant {
    pub name: String,
    pub public_key: Vec<u8>,
    pub e_private_key: Vec<u8>
}
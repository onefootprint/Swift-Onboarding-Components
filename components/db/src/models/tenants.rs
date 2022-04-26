use crate::schema::tenants;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "tenants"]
pub struct Tenant {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "tenants"]
pub struct NewTenant {
    pub name: String,
}
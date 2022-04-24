use crate::schema::tenant;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "tenant"]
pub struct Tenant {
    pub id: Uuid,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "tenant"]
pub struct NewTenant {
    pub name: String,
}

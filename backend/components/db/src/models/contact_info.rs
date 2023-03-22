use chrono::{DateTime, Utc};
use diesel::Queryable;
use newtypes::{ContactInfoId, DataLifetimeId, DataPriority};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = contact_info)]
/// Contains supplemental information for contact information stored inside the vault_data table
pub struct ContactInfo {
    pub id: ContactInfoId,
    pub is_verified: bool,
    pub priority: DataPriority,
    pub lifetime_id: DataLifetimeId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

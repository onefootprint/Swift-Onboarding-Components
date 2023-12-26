use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct UserTag {
    pub id: TagId,
    pub kind: String,
    pub created_at: DateTime<Utc>,
}

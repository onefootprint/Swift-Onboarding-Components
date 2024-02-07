use crate::*;
use newtypes::TagId;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct UserTag {
    pub id: TagId,
    pub tag: String,
    pub created_at: DateTime<Utc>,
}

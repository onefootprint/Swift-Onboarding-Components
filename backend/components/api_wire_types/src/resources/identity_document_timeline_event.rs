use crate::{export_schema, Apiv2Schema, DateTime, Deserialize, JsonSchema, Serialize, Utc};
use newtypes::{DocumentRequestStatus, IdentityDocumentId};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, Apiv2Schema)]
pub struct IdentityDocumentTimelineEvent {
    pub id: IdentityDocumentId,
    pub timestamp: DateTime<Utc>,
    pub status: DocumentRequestStatus,
}

export_schema!(IdentityDocumentTimelineEvent);

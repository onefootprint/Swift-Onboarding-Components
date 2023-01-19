use crate::{export_schema, Apiv2Schema, DateTime, Deserialize, JsonSchema, Serialize, Utc};
use newtypes::{DocumentRequestStatus, IdDocKind, IdentityDocumentId};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, Apiv2Schema)]
pub struct IdentityDocumentTimelineEvent {
    pub id: IdentityDocumentId,
    pub timestamp: DateTime<Utc>,
    pub status: DocumentRequestStatus,
    pub document_type: IdDocKind,
    pub selfie_collected: bool,
}

export_schema!(IdentityDocumentTimelineEvent);

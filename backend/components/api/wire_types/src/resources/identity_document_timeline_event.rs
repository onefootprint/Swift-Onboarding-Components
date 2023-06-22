use crate::{export_schema, Apiv2Schema, DateTime, JsonSchema, Serialize, Utc};
use newtypes::{DataIdentifier, DocumentRequestStatus, IdDocKind, IdentityDocumentId};

#[derive(Debug, Clone, Serialize, JsonSchema, Apiv2Schema)]
pub struct IdentityDocumentTimelineEvent {
    pub id: IdentityDocumentId,
    pub timestamp: DateTime<Utc>,
    pub status: DocumentRequestStatus,
    pub document_type: IdDocKind,
    pub document_identifier: DataIdentifier,
    pub selfie_collected: bool,
}

export_schema!(IdentityDocumentTimelineEvent);

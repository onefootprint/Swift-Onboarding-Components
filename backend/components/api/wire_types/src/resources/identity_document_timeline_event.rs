use crate::{export_schema, Apiv2Schema, JsonSchema, Serialize};
use newtypes::{DocumentRequestStatus, ModernIdDocKind};

#[derive(Debug, Clone, Serialize, JsonSchema, Apiv2Schema)]
pub struct IdentityDocumentTimelineEvent {
    pub status: DocumentRequestStatus,
    pub document_type: ModernIdDocKind,
    pub selfie_collected: bool,
}

export_schema!(IdentityDocumentTimelineEvent);

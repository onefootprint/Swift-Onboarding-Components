use crate::{export_schema, Apiv2Schema, JsonSchema, Serialize};
use newtypes::{DocumentScanDeviceType, IdentityDocumentStatus, ModernIdDocKind};

#[derive(Debug, Clone, Serialize, JsonSchema, Apiv2Schema)]
pub struct IdentityDocumentTimelineEvent {
    pub status: IdentityDocumentStatus,
    pub document_type: ModernIdDocKind,
    pub selfie_collected: bool,
    pub device_type: DocumentScanDeviceType,
}

export_schema!(IdentityDocumentTimelineEvent);

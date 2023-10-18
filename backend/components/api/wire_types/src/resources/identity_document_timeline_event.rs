use crate::{Apiv2Schema, Serialize};
use newtypes::{DocumentScanDeviceType, IdDocKind, IdentityDocumentStatus};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct IdentityDocumentTimelineEvent {
    pub status: IdentityDocumentStatus,
    pub document_type: IdDocKind,
    pub selfie_collected: bool,
    pub device_type: DocumentScanDeviceType,
}

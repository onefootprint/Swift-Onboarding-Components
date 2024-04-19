use crate::{Apiv2Schema, Serialize};
use newtypes::{DocumentRequestConfig, DocumentScanDeviceType, IdDocKind, IdentityDocumentStatus};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct DocumentUploadedTimelineEvent {
    pub status: IdentityDocumentStatus,
    pub document_type: IdDocKind,
    pub device_type: DocumentScanDeviceType,
    pub config: DocumentRequestConfig,
}

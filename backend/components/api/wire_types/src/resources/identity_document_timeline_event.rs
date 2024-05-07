use crate::{Apiv2Schema, Serialize};
use newtypes::{DocumentKind, DocumentRequestConfig, DocumentScanDeviceType, DocumentStatus};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct DocumentUploadedTimelineEvent {
    pub status: DocumentStatus,
    pub document_type: DocumentKind,
    pub device_type: DocumentScanDeviceType,
    pub config: DocumentRequestConfig,
}

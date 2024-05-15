use crate::{Apiv2Schema, Serialize};
use newtypes::{DeviceType, DocumentKind, DocumentRequestConfig, DocumentStatus};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct DocumentUploadedTimelineEvent {
    pub status: DocumentStatus,
    pub document_type: DocumentKind,
    pub device_type: DeviceType,
    pub config: DocumentRequestConfig,
}

use crate::Apiv2Schema;
use crate::Serialize;
use newtypes::DeviceType;
use newtypes::DocumentKind;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentStatus;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct DocumentUploadedTimelineEvent {
    pub status: DocumentStatus,
    pub document_type: DocumentKind,
    pub device_type: DeviceType,
    pub config: DocumentRequestConfig,
}

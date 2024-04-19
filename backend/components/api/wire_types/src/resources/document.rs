use crate::*;
use newtypes::{DataLifetimeSeqno, DocumentScanDeviceType, DocumentSide, IdDocKind, IdentityDocumentStatus};

use serde_with::SerializeDisplay;
pub use strum_macros::Display;

#[derive(Debug, Display, SerializeDisplay, Apiv2Schema)]
#[strum(serialize_all = "snake_case")]
pub enum UploadSource {
    Desktop,
    Mobile,
    Api,
}

impl From<DocumentScanDeviceType> for UploadSource {
    fn from(value: DocumentScanDeviceType) -> Self {
        match value {
            DocumentScanDeviceType::Desktop => Self::Desktop,
            DocumentScanDeviceType::Mobile => Self::Mobile,
        }
    }
}

#[derive(Debug, Serialize, Apiv2Schema)]
pub struct Document {
    pub kind: IdDocKind,
    /// Non-null for images uploaded via the UI
    pub started_at: Option<DateTime<Utc>>,
    /// Non-null for images uploaded via the UI
    pub status: Option<IdentityDocumentStatus>,
    pub completed_version: Option<DataLifetimeSeqno>,
    pub curp_completed_version: Option<DataLifetimeSeqno>,
    pub uploads: Vec<DocumentUpload>,
    pub document_score: Option<f64>,
    pub selfie_score: Option<f64>,
    pub ocr_confidence_score: Option<f64>,
    pub upload_source: UploadSource,
}

#[derive(Debug, Serialize, Apiv2Schema)]
pub struct DocumentUpload {
    pub timestamp: DateTime<Utc>,
    pub side: DocumentSide,
    pub failure_reasons: Vec<DocumentImageError>,
    pub version: DataLifetimeSeqno,
    /// When true, we detected that the user had a slow internet connection and the client compressed the image more than normal to allow for a faster upload.
    pub is_extra_compressed: bool,
}

#[derive(Debug, Serialize, Apiv2Schema)]
pub struct PublicDocument {
    /// Document type of the successfully uploaded document. Can be used to fetch from vault
    pub document_type: IdDocKind,
    pub created_at: DateTime<Utc>,
}

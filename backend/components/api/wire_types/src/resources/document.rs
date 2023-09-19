use crate::*;

use serde_with::SerializeDisplay;
pub use strum_macros::Display;

#[derive(Debug, Display, SerializeDisplay, Apiv2Schema, JsonSchema)]
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

#[derive(Debug, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct Document {
    pub kind: IdDocKind,
    /// Non-null for images uploaded via the UI
    pub started_at: Option<DateTime<Utc>>,
    /// Non-null for images uploaded via the UI
    pub status: Option<IdentityDocumentStatus>,
    pub completed_version: Option<DataLifetimeSeqno>,
    pub uploads: Vec<DocumentUpload>,
    pub document_score: Option<f64>,
    pub selfie_score: Option<f64>,
    pub ocr_confidence_score: Option<f64>,
    /// Deprecated
    pub device_type: DocumentScanDeviceType,
    pub upload_source: UploadSource,
}

#[derive(Debug, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct DocumentUpload {
    pub timestamp: DateTime<Utc>,
    pub side: DocumentSide,
    pub failure_reasons: Vec<DocumentImageError>,
    pub version: DataLifetimeSeqno,
}

export_schema!(Document);

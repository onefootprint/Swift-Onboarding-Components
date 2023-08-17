use crate::*;

#[derive(Debug, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct Document {
    pub kind: IdDocKind,
    pub started_at: DateTime<Utc>,
    pub status: IdentityDocumentStatus,
    pub completed_version: Option<DataLifetimeSeqno>,
    pub uploads: Vec<DocumentUpload>,
    pub document_score: Option<f64>,
    pub selfie_score: Option<f64>,
    pub ocr_confidence_score: Option<f64>,
    pub device_type: DocumentScanDeviceType,
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

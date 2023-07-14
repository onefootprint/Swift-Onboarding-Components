use crate::*;

#[derive(Debug, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct Document {
    pub kind: ModernIdDocKind,
    pub started_at: DateTime<Utc>,
    pub status: DocumentRequestStatus,
    pub completed_seqno: Option<DataLifetimeSeqno>,
    pub uploads: Vec<DocumentUpload>,
}

#[derive(Debug, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
pub struct DocumentUpload {
    pub timestamp: DateTime<Utc>,
    pub side: DocumentSide,
    pub failure_reasons: Vec<DocumentImageError>,
    pub created_seqno: DataLifetimeSeqno,
}

export_schema!(Document);

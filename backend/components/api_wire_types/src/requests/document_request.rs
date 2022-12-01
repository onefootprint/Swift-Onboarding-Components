use newtypes::{DocumentRequestStatus, PiiString};
use paperclip::actix::Apiv2Schema;
/// POST request body for sending Footprint identity document images
#[derive(Debug, Apiv2Schema, serde::Deserialize)]
pub struct DocumentRequest {
    /// base64 standard encoded image bytes
    pub front_image: PiiString,
    /// base64 standard encoded image bytes!)
    pub back_image: Option<PiiString>,
    /// type of document
    pub document_type: String,
    /// country of document
    pub country_code: String,
}
/// Status of identity document collection
#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum DocumentResponseStatus {
    Pending,
    Complete,
    Error,
    RetryLimitExceeded,
}

// This is temporary
impl From<DocumentRequestStatus> for DocumentResponseStatus {
    fn from(document_request_status: DocumentRequestStatus) -> Self {
        match document_request_status {
            DocumentRequestStatus::Pending => Self::Pending,
            DocumentRequestStatus::Failed => Self::Error,
            DocumentRequestStatus::Complete => Self::Complete,
            // We still are waiting for vendor when in Uploaded, but for now just map to Complete
            DocumentRequestStatus::Uploaded => Self::Complete,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum DocumentErrorReason {
    // TODO(argoff): These are just temporary values to test frontend
    Blurry,
    Invalid,
}

/// Response for a identity document request. Errors are non-optional if the identity vendor
/// requires additional images be collected.
#[derive(Debug, Apiv2Schema, serde::Serialize)]
pub struct DocumentResponse {
    pub status: DocumentResponseStatus,
    pub front_image_error: Option<DocumentErrorReason>,
    pub back_image_error: Option<DocumentErrorReason>,
}

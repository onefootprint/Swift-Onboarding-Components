use crate::export_schema;
use newtypes::{
    idology::IdologyImageCaptureErrors, DocumentRequestStatus, IdDocKind, IncodeVerificationFailureReason,
    PiiString,
};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;

/// POST request body for sending Footprint identity document images
#[derive(Debug, Apiv2Schema, serde::Deserialize)]
pub struct DocumentRequest {
    //TODO: rename to IdentityDocumentRequest
    /// base64 standard encoded image bytes
    pub front_image: Option<PiiString>,
    /// base64 standard encoded image bytes!)
    pub back_image: Option<PiiString>,
    pub selfie_image: Option<PiiString>,
    /// type of document
    pub document_type: IdDocKind,
    /// country of document
    pub country_code: String,
}

/// Status of identity document collection
#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, PartialEq, Eq)]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum DocumentResponseStatus {
    Pending,
    Complete,
    Error,
}

// This is temporary
impl From<DocumentRequestStatus> for DocumentResponseStatus {
    fn from(document_request_status: DocumentRequestStatus) -> Self {
        match document_request_status {
            DocumentRequestStatus::Pending => Self::Pending,
            DocumentRequestStatus::Failed => Self::Error,
            DocumentRequestStatus::Complete => Self::Complete,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum DocumentErrorReason {
    // TODO(argoff): These are just temporary values to test frontend
    Blurry,
    Invalid,
    ImageError,
}

/// Response for a identity document request. Errors are non-optional if the identity vendor
/// requires additional images be collected.
#[derive(Debug, Apiv2Schema, serde::Serialize)]
pub struct DocumentResponse {
    pub status: DocumentResponseStatus,
    pub errors: Vec<DocumentImageError>,
}

/// Image errors from idology. See status_code/idology.rs for descriptions
#[derive(Debug, Apiv2Schema, JsonSchema, serde::Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DocumentImageError {
    ImageTooSmall,
    DocumentMissingFourCorners,
    DocumentTooSmall,
    DocumentBorderTooSmall,
    FaceImageNotDetected,
    BarcodeNotDetected,
    ImageError,
    InvalidJpeg,
    DocumentIsSkewed,
    InternalError,
}
export_schema!(DocumentImageError);

impl From<IdologyImageCaptureErrors> for DocumentImageError {
    fn from(err: IdologyImageCaptureErrors) -> Self {
        match err {
            IdologyImageCaptureErrors::ImageTooSmall => Self::ImageTooSmall,
            IdologyImageCaptureErrors::DocumentMissingFourCorners => Self::DocumentMissingFourCorners,
            IdologyImageCaptureErrors::DocumentTooSmall => Self::DocumentTooSmall,
            IdologyImageCaptureErrors::DocumentBorderTooSmall => Self::DocumentBorderTooSmall,
            IdologyImageCaptureErrors::FaceImageNotDetected => Self::FaceImageNotDetected,
            IdologyImageCaptureErrors::BarcodeNotDetected => Self::BarcodeNotDetected,
            IdologyImageCaptureErrors::ImageError => Self::ImageError,
            IdologyImageCaptureErrors::InvalidJpeg => Self::InvalidJpeg,
            IdologyImageCaptureErrors::DocumentIsSkewed => Self::DocumentIsSkewed,
        }
    }
}

impl From<IncodeVerificationFailureReason> for DocumentImageError {
    // TODO: fix enum on frontend
    fn from(_err: IncodeVerificationFailureReason) -> Self {
        Self::ImageError
        // match err {
        //     IncodeVerificationFailureReason::UnknownDocumentType => Self::ImageError,
        //     IncodeVerificationFailureReason::WrongDocumentSide => Self::ImageError,
        //     IncodeVerificationFailureReason::WrongOneSidedDocument => Self::ImageError,
        //     IncodeVerificationFailureReason::DocumentNotReadable => Self::ImageError,
        //     IncodeVerificationFailureReason::UnableToAlignDocument => todo!(),
        //     IncodeVerificationFailureReason::IdTypeNotAcceptable => todo!(),
        //     IncodeVerificationFailureReason::UnexpectedErrorOccurred => Self::ImageError,
        //     IncodeVerificationFailureReason::Other(_) => todo!(),
        // }
    }
}

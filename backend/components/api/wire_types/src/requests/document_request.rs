use crate::export_schema;
use newtypes::{
    idology::IdologyImageCaptureErrors, DocumentRequestStatus, DocumentSide, IdDocKind, IncodeFailureReason,
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

// TODO deprecate after getting rid of GET /document/status API
/// Response for a identity document request. Errors are non-optional if the identity vendor
/// requires additional images be collected.
#[derive(Debug, Apiv2Schema, serde::Serialize)]
pub struct LegacyDocumentResponse {
    pub status: DocumentResponseStatus,
    pub errors: Vec<DocumentImageError>,
}

/// Response for a identity document request. Errors are non-optional if the identity vendor
/// requires additional images be collected.
#[derive(Debug, Apiv2Schema, serde::Serialize)]
pub struct DocumentResponse {
    pub next_side_to_collect: Option<DocumentSide>,
    pub errors: Vec<DocumentImageError>,
    pub is_retry_limit_exceeded: bool,
}

/// Image errors from idology. See status_code/idology.rs for descriptions
#[derive(Debug, Apiv2Schema, JsonSchema, serde::Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DocumentImageError {
    // Legacy, wil delete
    /// Deprecated
    ImageTooSmall,
    /// Deprecated
    DocumentMissingFourCorners,
    /// Deprecated
    DocumentTooSmall,
    /// Deprecated
    DocumentBorderTooSmall,
    /// Deprecated
    FaceImageNotDetected,
    /// Deprecated
    BarcodeNotDetected,
    /// Deprecated
    InvalidJpeg,
    /// Deprecated
    DocumentIsSkewed,
    /// Deprecated
    InternalError,
    /// Deprecated
    ImageError,

    UnknownDocumentType,
    WrongDocumentSide,
    WrongOneSidedDocument,
    DocumentNotReadable,
    UnableToAlignDocument,
    IdTypeNotAcceptable,
    SelfieFaceNotFound,
    SelfieLowConfidence,
    SelfieTooDark,
    SelfieGlare,
    SelfieHasLenses,
    SelfieHasFaceMask,
    UnknownError,
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

impl From<IncodeFailureReason> for DocumentImageError {
    fn from(err: IncodeFailureReason) -> Self {
        match err {
            IncodeFailureReason::UnknownDocumentType => Self::UnknownDocumentType,
            IncodeFailureReason::WrongDocumentSide => Self::WrongDocumentSide,
            IncodeFailureReason::WrongOneSidedDocument => Self::WrongOneSidedDocument,
            IncodeFailureReason::DocumentNotReadable => Self::DocumentNotReadable,
            IncodeFailureReason::UnableToAlignDocument => Self::UnableToAlignDocument,
            IncodeFailureReason::IdTypeNotAcceptable => Self::IdTypeNotAcceptable,
            IncodeFailureReason::UnexpectedErrorOccurred => Self::UnknownError,
            IncodeFailureReason::SelfieFaceNotFound => Self::SelfieFaceNotFound,
            IncodeFailureReason::SelfieLowConfidence => Self::SelfieLowConfidence,
            IncodeFailureReason::SelfieTooDark => Self::SelfieTooDark,
            IncodeFailureReason::SelfieGlare => Self::SelfieGlare,
            IncodeFailureReason::SelfieHasLenses => Self::SelfieHasLenses,
            IncodeFailureReason::SelfieHasFaceMask => Self::SelfieHasFaceMask,
            IncodeFailureReason::Other(_) => Self::UnknownError,
        }
    }
}

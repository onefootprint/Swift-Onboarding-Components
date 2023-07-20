use crate::export_schema;
use newtypes::{
    idology::IdologyImageCaptureErrors, DocumentSide, IdDocKind, IdentityDocumentId, IdentityDocumentStatus,
    IncodeFailureReason, ModernIdDocKind, PiiString,
};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;

/// POST request body for sending Footprint identity document images
#[derive(Debug, Apiv2Schema, serde::Deserialize)]
pub struct DocumentRequest {
    /// base64 standard encoded image bytes
    pub front_image: Option<PiiString>,
    /// base64 standard encoded image bytes!)
    pub back_image: Option<PiiString>,
    pub selfie_image: Option<PiiString>,
    /// type of document
    pub document_type: IdDocKind,
    /// country of document
    pub country_code: String, // TODO this should be an enum
}

#[derive(Debug, Apiv2Schema, serde::Deserialize)]
pub struct CreateIdentityDocumentUploadRequest {
    /// base64 standard encoded image bytes
    pub front_image: Option<PiiString>,
    /// base64 standard encoded image bytes
    pub back_image: Option<PiiString>,
    /// base64 standard encoded image bytes
    pub selfie_image: Option<PiiString>,
}

#[derive(Debug, Apiv2Schema, serde::Deserialize)]
pub struct CreateIdentityDocumentRequest {
    pub document_type: ModernIdDocKind,
    pub country_code: String, // TODO this should be an enum
}

#[derive(Debug, Apiv2Schema, serde::Serialize)]
pub struct CreateIdentityDocumentResponse {
    pub id: IdentityDocumentId,
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
impl From<IdentityDocumentStatus> for DocumentResponseStatus {
    fn from(document_request_status: IdentityDocumentStatus) -> Self {
        match document_request_status {
            IdentityDocumentStatus::Pending => Self::Pending,
            IdentityDocumentStatus::Failed => Self::Error,
            IdentityDocumentStatus::Complete => Self::Complete,
        }
    }
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

    /// The document provided doesn't match the type of document we were expecting
    DocTypeMismatch,
    UnknownDocumentType,
    UnsupportedDocumentType,
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
    UnknownCountryCode,
    CountryCodeMismatch,
    UnknownError,
    DocumentGlare,
    DocumentSharpness,
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
            IncodeFailureReason::UnsupportedDocumentType => Self::UnsupportedDocumentType,
            IncodeFailureReason::WrongDocumentSide => Self::WrongDocumentSide,
            IncodeFailureReason::WrongOneSidedDocument => Self::WrongOneSidedDocument,
            IncodeFailureReason::DocumentNotReadable => Self::DocumentNotReadable,
            IncodeFailureReason::UnableToAlignDocument => Self::UnableToAlignDocument,
            IncodeFailureReason::IdTypeNotAcceptable => Self::IdTypeNotAcceptable,
            IncodeFailureReason::DocTypeMismatch => Self::DocTypeMismatch,
            IncodeFailureReason::UnexpectedErrorOccurred => Self::UnknownError,
            IncodeFailureReason::SelfieFaceNotFound => Self::SelfieFaceNotFound,
            IncodeFailureReason::SelfieLowConfidence => Self::SelfieLowConfidence,
            IncodeFailureReason::SelfieTooDark => Self::SelfieTooDark,
            IncodeFailureReason::SelfieGlare => Self::SelfieGlare,
            IncodeFailureReason::SelfieHasLenses => Self::SelfieHasLenses,
            IncodeFailureReason::SelfieHasFaceMask => Self::SelfieHasFaceMask,
            IncodeFailureReason::UnknownCountryCode => Self::UnknownCountryCode,
            IncodeFailureReason::CountryCodeMismatch => Self::CountryCodeMismatch,
            IncodeFailureReason::Other(_) => Self::UnknownError,
            IncodeFailureReason::DocumentGlare => Self::DocumentGlare,
            IncodeFailureReason::DocumentSharpness => Self::DocumentSharpness,
        }
    }
}

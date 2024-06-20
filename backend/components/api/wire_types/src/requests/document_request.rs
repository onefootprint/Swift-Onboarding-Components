use newtypes::DeviceType;
use newtypes::DocumentFixtureResult;
use newtypes::DocumentId;
use newtypes::DocumentKind;
use newtypes::DocumentRequestId;
use newtypes::DocumentSide;
use newtypes::DocumentStatus;
use newtypes::IncodeFailureReason;
use newtypes::Iso3166TwoDigitCountryCode;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Apiv2Schema, serde::Deserialize)]
pub struct CreateDocumentRequest {
    pub document_type: DocumentKind,
    pub country_code: Option<Iso3166TwoDigitCountryCode>,
    pub fixture_result: Option<DocumentFixtureResult>,
    pub skip_selfie: Option<bool>,
    pub device_type: Option<DeviceType>,
    // TODO make required
    pub request_id: Option<DocumentRequestId>,
}

#[derive(Debug, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct CreateDocumentResponse {
    pub id: DocumentId,
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
impl From<DocumentStatus> for DocumentResponseStatus {
    fn from(document_request_status: DocumentStatus) -> Self {
        match document_request_status {
            DocumentStatus::Pending => Self::Pending,
            DocumentStatus::Failed => Self::Error,
            DocumentStatus::Complete => Self::Complete,
        }
    }
}

/// Response for a identity document request. Errors are non-optional if the identity vendor.
/// Requires additional images be collected.
#[derive(Debug, Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct DocumentResponse {
    pub next_side_to_collect: Option<DocumentSide>,
    pub errors: Vec<DocumentImageError>,
    pub is_retry_limit_exceeded: bool,
}

#[derive(Debug, Apiv2Schema, serde::Serialize, PartialEq, Eq)]
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
    FaceNotFound,
    SelfieLowConfidence,
    SelfieTooDark,
    SelfieGlare,
    SelfieHasLenses,
    SelfieHasFaceMask,
    SelfieBlurry,
    SelfieImageSizeUnsupported,
    SelfieImageOrientationIncorrect,
    SelfieBadImageCompression,
    DriversLicensePermitNotAllowed,
    UnknownCountryCode,
    CountryCodeMismatch,
    UnknownError,
    DocumentGlare,
    DocumentSharpness,
    MilitaryIdNotAllowed,
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
            IncodeFailureReason::FaceCroppingFailure => Self::UnknownError,
            IncodeFailureReason::SelfieBlurry => Self::SelfieBlurry,
            IncodeFailureReason::SelfieImageSizeUnsupported => Self::SelfieImageSizeUnsupported,
            IncodeFailureReason::SelfieImageOrientationIncorrect => Self::SelfieImageOrientationIncorrect,
            IncodeFailureReason::SelfieBadImageCompression => Self::SelfieBadImageCompression,
            IncodeFailureReason::DriversLicensePermitNotAllowed => Self::DriversLicensePermitNotAllowed,
            IncodeFailureReason::FaceNotFound => Self::FaceNotFound,
            IncodeFailureReason::ProcessIdCouldNotProcess => Self::DocumentNotReadable, // close enough
            IncodeFailureReason::MilitaryIdNotAllowed => Self::MilitaryIdNotAllowed,
            IncodeFailureReason::InvalidCurp => Self::UnknownError, // doesn't apply in this codepath
        }
    }
}

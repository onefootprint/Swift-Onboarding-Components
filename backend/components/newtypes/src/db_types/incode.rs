use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumIter, EnumString};

use crate::FootprintReasonCode;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IncodeVerificationSessionState {
    /// This state is orchestrated manually
    StartOnboarding,
    AddFront,
    AddBack,
    AddConsent,
    AddSelfie,
    ProcessId,
    ProcessFace,
    GetOnboardingStatus,
    FetchScores,
    Complete,
    Fail,
}

impl IncodeVerificationSessionState {
    // Indicates the current state is not a state contingent on user input but rather a state involving processing the doc with Incode
    pub fn is_processing_state(&self) -> bool {
        match self {
            Self::StartOnboarding
            | Self::AddFront
            | Self::AddBack
            | Self::AddSelfie
            | Self::Complete
            | Self::Fail => false,
            Self::GetOnboardingStatus
            | Self::FetchScores
            | Self::AddConsent
            | Self::ProcessId
            | Self::ProcessFace => true,
        }
    }
}

#[derive(
    Debug,
    Display,
    Clone,
    Eq,
    PartialEq,
    Hash,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    Apiv2Schema,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
/// The list of strongly-typed errors we can extract from incode responses that are specifcially
/// retryable.
/// Each of these corresponds to an error message we'll display on the client prompting them to
/// re-upload an image.
pub enum IncodeFailureReason {
    #[strum(serialize = "UNKNOWN_DOCUMENT_TYPE")]
    UnknownDocumentType,
    #[strum(serialize = "WRONG_DOCUMENT_SIDE")]
    WrongDocumentSide,
    #[strum(serialize = "WRONG_ONE_SIDED_DOCUMENT")]
    WrongOneSidedDocument,
    #[strum(serialize = "DOCUMENT_NOT_READABLE")]
    DocumentNotReadable,
    #[strum(serialize = "UNABLE_TO_ALIGN_DOCUMENT")]
    UnableToAlignDocument,
    #[strum(serialize = "ID_TYPE_UNACCEPTABLE")]
    IdTypeNotAcceptable,
    #[strum(serialize = "UNEXPECTED_ERROR_OCCURRED")]
    UnexpectedErrorOccurred,
    // These aren't deserialized with strum
    UnsupportedDocumentType,
    DocTypeMismatch,
    FaceCroppingFailure,
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
    UnknownCountryCode,
    CountryCodeMismatch,
    DriversLicensePermitNotAllowed,
    DocumentGlare,
    DocumentSharpness,
    Other(String),
}

impl IncodeFailureReason {
    pub fn can_ignore(&self) -> bool {
        true
    }

    pub fn reason_code(&self) -> Option<FootprintReasonCode> {
        match self {
            // These cause the user to be put in manual review
            Self::DocTypeMismatch => Some(FootprintReasonCode::DocumentTypeMismatch),
            Self::UnknownCountryCode => Some(FootprintReasonCode::DocumentUnknownCountryCode),
            Self::CountryCodeMismatch => Some(FootprintReasonCode::DocumentCountryCodeMismatch),
            Self::DriversLicensePermitNotAllowed => {
                Some(FootprintReasonCode::DocumentIsPermitOrProvisionalLicense)
            }
            _ => None,
        }
    }

    pub fn can_proceed_immediately_if_present(&self) -> bool {
        matches!(self, Self::DriversLicensePermitNotAllowed)
    }

    pub fn selfie_processing_failed(&self) -> bool {
        matches!(self, Self::SelfieFaceNotFound)
    }
}

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    macros::SerdeAttr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IncodeVerificationSessionKind {
    IdDocument,
    Selfie,
}

impl IncodeVerificationSessionKind {
    pub fn requires_selfie(&self) -> bool {
        match self {
            IncodeVerificationSessionKind::IdDocument => false,
            IncodeVerificationSessionKind::Selfie => true,
        }
    }
}

crate::util::impl_enum_str_diesel!(IncodeVerificationSessionState);
crate::util::impl_enum_str_diesel!(IncodeFailureReason);
crate::util::impl_enum_str_diesel!(IncodeVerificationSessionKind);

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    macros::SerdeAttr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IncodeEnvironment {
    Demo,
    Production,
}

crate::util::impl_enum_str_diesel!(IncodeEnvironment);

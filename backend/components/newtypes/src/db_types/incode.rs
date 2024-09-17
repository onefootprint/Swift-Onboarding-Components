use crate::FootprintReasonCode;
use derive_more::Display;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use strum_macros::AsRefStr;
use strum_macros::EnumIter;
use strum_macros::EnumString;

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
    pub fn is_terminal(&self) -> bool {
        match self {
            Self::StartOnboarding
            | Self::AddFront
            | Self::AddBack
            | Self::AddSelfie
            | Self::GetOnboardingStatus
            | Self::FetchScores
            | Self::AddConsent
            | Self::ProcessId
            | Self::ProcessFace => false,
            Self::Fail | Self::Complete => true,
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
    UnexpectedErrorOccurred, /* TODO: its kinda wack we just synthetically produce this ourselves as
                              * well... need to audit what kinds of errors we are swallowing in here
                              * (this will cause us to ask user to re-upload, even if its some transient
                              * Incode nonsense and not a actual validation issue) */
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
    ProcessIdCouldNotProcess,
    MilitaryIdNotAllowed,
    InvalidCurp,
    Other(String),
}

impl IncodeFailureReason {
    pub fn can_ignore(&self) -> bool {
        // IdTypeNotAcceptable | MilitaryIdNotAllowed => military IDs which incode cannot process (nor can
        // we) ProcessIdCouldNotProcess => something is up with the image and incode can't run it's
        // ML models
        !matches!(
            self,
            Self::IdTypeNotAcceptable | Self::ProcessIdCouldNotProcess | Self::MilitaryIdNotAllowed
        )
    }

    pub fn reason_code(&self) -> Option<FootprintReasonCode> {
        match self {
            // These cause the user to be put in manual review
            Self::DocTypeMismatch => Some(FootprintReasonCode::DocumentTypeMismatch),
            Self::UnknownCountryCode => Some(FootprintReasonCode::DocumentUnknownCountryCode),
            Self::CountryCodeMismatch => Some(FootprintReasonCode::DocumentCountryCodeMismatch),
            Self::SelfieTooDark | Self::SelfieLowConfidence => {
                Some(FootprintReasonCode::DocumentSelfieBadQuality)
            }
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
        matches!(self, Self::SelfieFaceNotFound | Self::SelfieTooDark)
    }

    pub fn selfie_document_processing_failed(&self) -> bool {
        matches!(
            self,
            Self::UnknownDocumentType | Self::WrongDocumentSide | Self::FaceNotFound
        )
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
    derive_more::IsVariant,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IncodeVerificationSessionKind {
    IdDocument,
    Selfie,
    CurpValidation,
    GovernmentValidation,
}

impl IncodeVerificationSessionKind {
    pub fn requires_selfie(&self) -> bool {
        match self {
            IncodeVerificationSessionKind::IdDocument => false,
            IncodeVerificationSessionKind::Selfie => true,
            IncodeVerificationSessionKind::CurpValidation => false,
            IncodeVerificationSessionKind::GovernmentValidation => false,
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
    Deserialize,
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
pub enum IncodeVerificationSessionPurpose {
    Identity,
    CurpValidation,
    GovernmentValidation,
}

crate::util::impl_enum_str_diesel!(IncodeVerificationSessionPurpose);

impl From<IncodeVerificationSessionKind> for IncodeVerificationSessionPurpose {
    fn from(value: IncodeVerificationSessionKind) -> Self {
        match value {
            IncodeVerificationSessionKind::IdDocument => IncodeVerificationSessionPurpose::Identity,
            IncodeVerificationSessionKind::Selfie => IncodeVerificationSessionPurpose::Identity,
            IncodeVerificationSessionKind::CurpValidation => IncodeVerificationSessionPurpose::CurpValidation,
            IncodeVerificationSessionKind::GovernmentValidation => {
                IncodeVerificationSessionPurpose::GovernmentValidation
            }
        }
    }
}

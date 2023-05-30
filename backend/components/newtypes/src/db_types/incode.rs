pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumIter, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    Apiv2Schema,
    JsonSchema,
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
    ProcessId,
    FetchScores,
    FetchOCR,
    Complete,
}

#[derive(
    Debug,
    Display,
    Clone,
    Eq,
    PartialEq,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    Apiv2Schema,
    JsonSchema,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
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
    #[strum(serialize = "SELFIE_LOW_CONFIDENCE")]
    SelfieLowConfidence,
    #[strum(serialize = "SELFIE_TOO_DARK")]
    SelfieTooDark,
    #[strum(serialize = "SELFIE_GLARE")]
    SelfieGlare,
    #[strum(serialize = "SELFIE_HAS_LENSES")]
    SelfieHasLenses,
    #[strum(serialize = "SELFIE_HAS_FACE_MASK")]
    SelfieHasFaceMask,
    Other(String),
}

#[derive(
    Debug,
    Display,
    Clone,
    Eq,
    PartialEq,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    Apiv2Schema,
    JsonSchema,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IncodeVerificationSessionKind {
    IdDocument,
    // TODO: Should this be something like IdDocAndSelfie?
    Selfie,
}

impl IncodeVerificationSessionKind {
    pub fn requires_selfie(&self) -> bool {
        match self {
            IncodeVerificationSessionKind::IdDocument => false,
            IncodeVerificationSessionKind::Selfie => true,
        }
    }

    pub fn requires_consent(&self) -> bool {
        self.requires_selfie()
    }
}

crate::util::impl_enum_str_diesel!(IncodeVerificationSessionState);
crate::util::impl_enum_str_diesel!(IncodeFailureReason);
crate::util::impl_enum_str_diesel!(IncodeVerificationSessionKind);

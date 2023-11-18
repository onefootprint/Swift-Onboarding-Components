use crate::{util::impl_enum_str_diesel, DecisionStatus};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::AsRefStr;
use strum_macros::{Display, EnumIter, EnumString};

#[derive(
    Display,
    SerializeDisplay,
    DeserializeFromStr,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Hash,
    Ord,
    PartialOrd,
    EnumIter,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum RuleAction {
    /// ORDERING MATTERS!!!
    PassWithManualReview,
    ManualReview,
    StepUp,
    Fail,
}

impl_enum_str_diesel!(RuleAction);

impl From<&RuleAction> for DecisionStatus {
    fn from(value: &RuleAction) -> Self {
        match value {
            RuleAction::PassWithManualReview => DecisionStatus::Pass,
            RuleAction::StepUp => DecisionStatus::StepUp,
            RuleAction::ManualReview => DecisionStatus::Fail,
            RuleAction::Fail => DecisionStatus::Fail,
        }
    }
}

impl RuleAction {
    pub fn should_create_review(&self) -> bool {
        matches!(self, Self::PassWithManualReview | Self::ManualReview)
    }
}

#[derive(
    Display,
    SerializeDisplay,
    DeserializeFromStr,
    Debug,
    Clone,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Hash,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum RuleName {
    IdNotLocated,
    IdFlagged,
    SubjectDeceased,
    AddressInputIsPoBox,
    CoppaAlert,
    SsnDoesNotMatch,
    AddressDoesNotMatch,
    NameDoesNotMatch,
    DobDoesNotMatch,
    SsnInputIsInvalid,
    SsnLocatedIsInvalid,
    SsnIssuedPriorToDob,
    SsnNotProvided,
    WatchlistHit,
    WatchlistHitStepUp,
    PepHit,
    AdverseMediaHit,
    ThinFile,
    AddressLocatedIsWarm,
    AddressLocatedIsHighRiskAddress,
    MultipleRecordsFound,
    DocumentNotVerified,
    SelfieDoesNotMatch,
    DocumentUploadFailed,
    DocumentCollectionErrored,
    Test(String),
    BusinessWatchlistHit,
    NoTinMatch,
    NoBusinessNameMatch,
    NoBusinessAddressMatch,
    BoNonPassingKyc,
    DocumentWasLearnerPermit,
    DocumentExpired,
    DocumentCollected,
    DocumentAddressDoesntMatch,
    DocumentDobDoesntMatch,
    DocumentNameDoesntMatch,
}

impl_enum_str_diesel!(RuleName);

#[derive(Debug, Eq, PartialEq, Display, Hash, Clone, Copy, AsExpression, FromSqlRow, EnumString)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum RuleSetResultKind {
    KycWaterfall,
    WorkflowDecision,
    Adhoc,
    Backtest,
}

crate::util::impl_enum_string_diesel!(RuleSetResultKind);

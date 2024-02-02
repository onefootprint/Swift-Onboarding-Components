use crate::{
    util::{impl_enum_str_diesel, impl_enum_string_diesel},
    DecisionStatus, DocKind,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::{AsRefStr, ParseError};
use strum_macros::{Display, EnumIter, EnumString};

#[derive(
    SerializeDisplay,
    DeserializeFromStr,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    Hash,
    Ord,
    PartialOrd,
    EnumIter,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[diesel(sql_type = Text)]
pub enum RuleAction {
    /// ORDERING MATTERS!!!
    PassWithManualReview,
    ManualReview,
    StepUp(StepUpKind),
    Fail,
}

impl RuleAction {
    pub fn identity_stepup() -> Self {
        Self::StepUp(StepUpKind::Identity)
    }
}

#[derive(
    Display,
    Debug,
    SerializeDisplay,
    DeserializeFromStr,
    EnumString,
    Eq,
    PartialEq,
    Hash,
    Clone,
    Copy,
    AsRefStr,
    Default,
    PartialOrd,
    Ord,
)]
#[strum(serialize_all = "snake_case")]
pub enum StepUpKind {
    #[default]
    Identity,
    ProofOfSsn,
    ProofOfAddress,
    IdentityProofOfSsn,
    IdentityProofOfAddress,
    ProofOfSsnProofOfAddress,
    IdentityProofOfSsnProofOfAddress,
}

impl StepUpKind {
    pub fn to_doc_kinds(&self) -> Vec<DocKind> {
        match self {
            StepUpKind::Identity => vec![DocKind::Identity],
            StepUpKind::ProofOfSsn => vec![DocKind::ProofOfSsn],
            StepUpKind::ProofOfAddress => vec![DocKind::ProofOfAddress],
            StepUpKind::IdentityProofOfSsn => vec![DocKind::Identity, DocKind::ProofOfSsn],
            StepUpKind::IdentityProofOfAddress => vec![DocKind::Identity, DocKind::ProofOfAddress],
            StepUpKind::ProofOfSsnProofOfAddress => vec![DocKind::ProofOfSsn, DocKind::ProofOfAddress],
            StepUpKind::IdentityProofOfSsnProofOfAddress => {
                vec![DocKind::Identity, DocKind::ProofOfSsn, DocKind::ProofOfAddress]
            }
        }
    }
}

impl std::fmt::Display for RuleAction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RuleAction::PassWithManualReview => write!(f, "pass_with_manual_review"),
            RuleAction::ManualReview => write!(f, "manual_review"),
            RuleAction::Fail => write!(f, "fail"),
            RuleAction::StepUp(suk) => {
                write!(f, "step_up.{}", suk)
            }
        }
    }
}

impl std::str::FromStr for RuleAction {
    type Err = ParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "pass_with_manual_review" => Ok(RuleAction::PassWithManualReview),
            "manual_review" => Ok(RuleAction::ManualReview),
            "fail" => Ok(RuleAction::Fail),
            s if s.starts_with("step_up.") => {
                let suk = s.split('.').nth(1).ok_or(ParseError::VariantNotFound)?;
                Ok(RuleAction::StepUp(StepUpKind::from_str(suk)?))
            }
            // legacy
            s if s.starts_with("step_up") => Ok(RuleAction::StepUp(StepUpKind::Identity)),
            _ => Err(ParseError::VariantNotFound),
        }
    }
}

impl_enum_string_diesel!(RuleAction);

impl From<&RuleAction> for DecisionStatus {
    fn from(value: &RuleAction) -> Self {
        match value {
            RuleAction::PassWithManualReview => DecisionStatus::Pass,
            RuleAction::StepUp(_) => DecisionStatus::StepUp,
            RuleAction::ManualReview => DecisionStatus::Fail,
            RuleAction::Fail => DecisionStatus::Fail,
        }
    }
}

impl From<Option<RuleAction>> for DecisionStatus {
    fn from(value: Option<RuleAction>) -> Self {
        match value {
            Some(ra) => (&ra).into(),
            None => DecisionStatus::Pass,
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
    SelfieIsNotLive,
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case(RuleAction::Fail, "fail")]
    #[test_case(RuleAction::ManualReview, "manual_review")]
    #[test_case(RuleAction::PassWithManualReview, "pass_with_manual_review")]
    #[test_case(RuleAction::StepUp(StepUpKind::default()), "step_up.identity")]
    #[test_case(
        RuleAction::StepUp(StepUpKind::IdentityProofOfAddress),
        "step_up.identity_proof_of_address"
    )]
    #[test_case(RuleAction::StepUp(StepUpKind::ProofOfAddress), "step_up.proof_of_address")]
    #[test_case(RuleAction::StepUp(StepUpKind::ProofOfSsn), "step_up.proof_of_ssn")]
    #[test_case(
        RuleAction::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress),
        "step_up.identity_proof_of_ssn_proof_of_address"
    )]
    fn test_rule_action_string(ra: RuleAction, expected: &str) {
        let ser = ra.to_string();
        assert_eq!(ser, expected);
        let parsed = RuleAction::from_str(&ser).unwrap();
        assert_eq!(ra, parsed)
    }

    #[test]
    fn test_legacy_rule_action_stepup() {
        // legacy
        assert_eq!(
            RuleAction::from_str("step_up").unwrap(),
            RuleAction::StepUp(StepUpKind::Identity)
        )
    }
}

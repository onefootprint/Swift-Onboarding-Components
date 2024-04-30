use crate::{
    util::{impl_enum_str_diesel, impl_enum_string_diesel},
    DecisionStatus, DocumentRequestConfig, DocumentRequestKind,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::v2::models::DataType;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::{AsRefStr, IntoEnumIterator, ParseError};
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
    // TODO(argoff): come back and fix this somehow. not good to have around
    EnumIter,
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

    // Strum doesn't handle nested enums very well, so we can't use EnumIter
    pub fn all_rule_actions() -> Vec<Self> {
        vec![
            RuleAction::PassWithManualReview,
            RuleAction::ManualReview,
            RuleAction::Fail,
        ]
        .into_iter()
        .chain(StepUpKind::iter().map(RuleAction::StepUp))
        .collect()
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
    EnumIter,
    Ord,
)]
#[strum(serialize_all = "snake_case")]
pub enum StepUpKind {
    #[default]
    Identity,
    ProofOfAddress,
    IdentityProofOfSsn,
    IdentityProofOfSsnProofOfAddress,
}

impl StepUpKind {
    pub fn to_doc_configs(&self) -> Vec<DocumentRequestConfig> {
        let doc_kinds = match self {
            StepUpKind::Identity => vec![DocumentRequestKind::Identity],
            StepUpKind::ProofOfAddress => vec![DocumentRequestKind::ProofOfAddress],
            StepUpKind::IdentityProofOfSsn => {
                vec![DocumentRequestKind::Identity, DocumentRequestKind::ProofOfSsn]
            }
            StepUpKind::IdentityProofOfSsnProofOfAddress => {
                vec![
                    DocumentRequestKind::Identity,
                    DocumentRequestKind::ProofOfSsn,
                    DocumentRequestKind::ProofOfAddress,
                ]
            }
        };

        doc_kinds
            .into_iter()
            .filter_map(|kind| match kind {
                DocumentRequestKind::Identity => Some(DocumentRequestConfig::Identity {
                    collect_selfie: true, // TODO: should come from config
                }),
                DocumentRequestKind::ProofOfAddress => Some(DocumentRequestConfig::ProofOfAddress {}),
                DocumentRequestKind::ProofOfSsn => Some(DocumentRequestConfig::ProofOfSsn {}),
                DocumentRequestKind::Custom => None,
            })
            .collect()
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

// Custom impl since paperclip won't display the nested enums properly
impl paperclip::v2::schema::Apiv2Schema for RuleAction {
    fn name() -> Option<String> {
        Some("RuleAction".to_string())
    }

    fn description() -> &'static str {
        "Represents an action that a Rule can take"
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        use paperclip::v2::models::DefaultSchemaRaw;
        DefaultSchemaRaw {
            name: Some("RuleAction".into()),
            data_type: Some(DataType::String),
            enum_: Self::all_rule_actions()
                .into_iter()
                .map(|ra| serde_json::Value::String(ra.to_string()))
                .collect(),
            ..Default::default()
        }
    }
}
impl paperclip::actix::OperationModifier for RuleAction {}

impl From<RuleAction> for DecisionStatus {
    fn from(value: RuleAction) -> Self {
        match value {
            RuleAction::PassWithManualReview => DecisionStatus::Pass,
            RuleAction::StepUp(_) => DecisionStatus::StepUp,
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


#[derive(
    Debug, Eq, PartialEq, Display, Hash, Clone, Copy, AsExpression, FromSqlRow, EnumString, PartialOrd, Ord,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum RuleInstanceKind {
    Person,
    Business,
    Any,
}

crate::util::impl_enum_string_diesel!(RuleInstanceKind);

#[cfg(test)]
mod tests {
    use super::*;
    use std::{cmp::Ordering, str::FromStr};
    use test_case::test_case;

    #[test_case(RuleAction::Fail, "fail")]
    #[test_case(RuleAction::ManualReview, "manual_review")]
    #[test_case(RuleAction::PassWithManualReview, "pass_with_manual_review")]
    #[test_case(RuleAction::StepUp(StepUpKind::default()), "step_up.identity")]
    #[test_case(RuleAction::StepUp(StepUpKind::ProofOfAddress), "step_up.proof_of_address")]
    #[test_case(
        RuleAction::StepUp(StepUpKind::IdentityProofOfSsn),
        "step_up.identity_proof_of_ssn"
    )]
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

    #[test]
    fn test_all_rule_actions() {
        // If this fails, please do 3 things:
        // 1) Make sure you are adding the right ordering
        // 2) add new RuleAction to `all_rule_actions`. <-- Use this in application code
        // 3) Please don't use RuleAction::iter()!!!
        let ra_iter_len = RuleAction::iter().len() - 1; // -1 because this includes StepUpKind::default already
        let suk_iter_len = StepUpKind::iter().len();
        let all_action_len = RuleAction::all_rule_actions().len();
        let expected = ra_iter_len + suk_iter_len;

        assert_eq!(all_action_len, 7);
        assert_eq!(all_action_len, expected);
    }

    // We take the max for rule eval
    #[test_case(RuleAction::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress), RuleAction::StepUp(StepUpKind::IdentityProofOfSsn) => Ordering::Greater)]
    #[test_case(RuleAction::StepUp(StepUpKind::IdentityProofOfSsn), RuleAction::StepUp(StepUpKind::ProofOfAddress) => Ordering::Greater)]
    #[test_case(RuleAction::StepUp(StepUpKind::ProofOfAddress), RuleAction::StepUp(StepUpKind::Identity) => Ordering::Greater)]
    #[test_case(RuleAction::Fail, RuleAction::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress) => Ordering::Greater)]
    #[test_case(RuleAction::identity_stepup(), RuleAction::PassWithManualReview  => Ordering::Greater)]
    #[test_case(RuleAction::ManualReview, RuleAction::PassWithManualReview  => Ordering::Greater)]
    #[test_case(RuleAction::identity_stepup(), RuleAction::ManualReview => Ordering::Greater)]
    #[test_case(RuleAction::Fail, RuleAction::identity_stepup() => Ordering::Greater)]
    fn test_ra_cmp(ra1: RuleAction, ra2: RuleAction) -> Ordering {
        ra1.cmp(&ra2)
    }

    #[test_case(RuleInstanceKind::Person, RuleInstanceKind::Any => Ordering::Less)]
    #[test_case(RuleInstanceKind::Business, RuleInstanceKind::Any => Ordering::Less)]
    fn test_rik_cmp(ra1: RuleInstanceKind, ra2: RuleInstanceKind) -> Ordering {
        ra1.cmp(&ra2)
    }
}

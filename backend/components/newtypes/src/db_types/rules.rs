use super::DocumentAndCountryConfiguration;
use crate::util::impl_enum_string_diesel;
use crate::DecisionStatus;
use crate::DocumentRequestConfig;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use paperclip::v2::models::DataType;
use serde::Deserialize;
use serde::Serialize;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum::AsRefStr;
use strum::IntoEnumIterator;
use strum::ParseError;
use strum_macros::Display;
use strum_macros::EnumDiscriminants;
use strum_macros::EnumIter;
use strum_macros::EnumString;

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

    pub fn to_rule_action(&self) -> RuleActionConfig {
        match self {
            RuleAction::PassWithManualReview => RuleActionConfig::PassWithManualReview {},
            RuleAction::ManualReview => RuleActionConfig::ManualReview {},
            RuleAction::StepUp(step_up_kind) => RuleActionConfig::StepUp(step_up_kind.to_doc_configs()),
            RuleAction::Fail => RuleActionConfig::Fail {},
        }
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
    // Temporary
    Custom,
}

impl StepUpKind {
    pub fn to_doc_configs(&self) -> Vec<DocumentRequestConfig> {
        match self {
            StepUpKind::Identity => vec![DocumentRequestConfig::Identity {
                collect_selfie: true, // TODO: should come from config
                document_types_and_countries: Some(DocumentAndCountryConfiguration::default()),
            }],
            StepUpKind::ProofOfAddress => vec![DocumentRequestConfig::ProofOfAddress {
                requires_human_review: true,
            }],
            StepUpKind::IdentityProofOfSsn => vec![
                DocumentRequestConfig::Identity {
                    collect_selfie: true, // TODO: should come from config
                    document_types_and_countries: Some(DocumentAndCountryConfiguration::default()),
                },
                DocumentRequestConfig::ProofOfSsn {
                    requires_human_review: true,
                },
            ],
            StepUpKind::IdentityProofOfSsnProofOfAddress => vec![
                DocumentRequestConfig::Identity {
                    collect_selfie: true, // TODO: should come from config
                    document_types_and_countries: Some(DocumentAndCountryConfiguration::default()),
                },
                DocumentRequestConfig::ProofOfAddress {
                    requires_human_review: true,
                },
                DocumentRequestConfig::ProofOfSsn {
                    requires_human_review: true,
                },
            ],
            // Not used, temporary
            StepUpKind::Custom => vec![],
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
    Debug,
    Eq,
    PartialEq,
    Display,
    Hash,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    Apiv2Schema,
    SerializeDisplay,
    DeserializeFromStr,
    PartialOrd,
    Ord,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum RuleInstanceKind {
    Person,
    Business,
    Any,
}

crate::util::impl_enum_string_diesel!(RuleInstanceKind);


#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, Apiv2Schema, EnumDiscriminants)]
#[strum_discriminants(name(RuleActionDiscriminant))] // TODO: rename
#[strum_discriminants(derive(
    serde_with::SerializeDisplay,
    strum_macros::Display,
    EnumString,
    Hash,
    strum::EnumIter,
    PartialOrd,
    Ord,
))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "config")]
pub enum RuleActionConfig {
    /// ORDERING MATTERS!!!
    PassWithManualReview {},
    ManualReview {},
    StepUp(Vec<DocumentRequestConfig>),
    Fail {},
}

impl PartialOrd for RuleActionConfig {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for RuleActionConfig {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        let self_discr: RuleActionDiscriminant = self.into();
        let other_discr: RuleActionDiscriminant = other.into();

        self_discr.cmp(&other_discr)
    }
}

impl Eq for RuleActionConfig {}

impl PartialEq for RuleActionConfig {
    fn eq(&self, other: &Self) -> bool {
        let self_discr: RuleActionDiscriminant = self.into();
        let other_discr: RuleActionDiscriminant = other.into();

        self_discr == other_discr
    }
}

impl From<RuleActionConfig> for RuleAction {
    fn from(value: RuleActionConfig) -> Self {
        match value {
            RuleActionConfig::PassWithManualReview {} => RuleAction::PassWithManualReview,
            RuleActionConfig::ManualReview {} => RuleAction::ManualReview,
            RuleActionConfig::StepUp(doc_requests) => {
                let action = derive_step_up_kind_from_doc_configs(doc_requests);
                RuleAction::StepUp(action)
            }
            RuleActionConfig::Fail {} => RuleAction::Fail,
        }
    }
}

// From a list of document requests, back into what the action was
fn derive_step_up_kind_from_doc_configs(doc_requests: Vec<DocumentRequestConfig>) -> StepUpKind {
    StepUpKind::iter()
        .find(|suk| have_same_elements(suk.to_doc_configs(), doc_requests.clone()))
        .unwrap_or(StepUpKind::Custom)
}

fn have_same_elements<T>(l: Vec<T>, r: Vec<T>) -> bool
where
    T: Eq,
{
    l.iter().all(|i| r.contains(i)) && r.iter().all(|i| l.contains(i)) && l.len() == r.len()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::CustomDocumentConfig;
    use crate::DataIdentifier;
    use crate::DocumentUploadSettings;
    use std::cmp::Ordering;
    use std::str::FromStr;
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


    #[test_case(RuleActionConfig::StepUp(vec![DocumentRequestConfig::Identity {collect_selfie: true, document_types_and_countries: None}]), RuleActionConfig::StepUp(vec![DocumentRequestConfig::ProofOfAddress {requires_human_review: false}]) => Ordering::Equal)]
    #[test_case(RuleActionConfig::Fail {}, RuleActionConfig::StepUp(vec![DocumentRequestConfig::Identity {collect_selfie: true, document_types_and_countries: None}]) => Ordering::Greater)]
    #[test_case(RuleActionConfig::Fail {}, RuleActionConfig::ManualReview {} => Ordering::Greater)]
    #[test_case(RuleActionConfig::Fail {}, RuleActionConfig::PassWithManualReview {} => Ordering::Greater)]
    #[test_case(RuleActionConfig::ManualReview {}, RuleActionConfig::PassWithManualReview {} => Ordering::Greater)]
    #[test_case(RuleActionConfig::StepUp(vec![DocumentRequestConfig::Identity {collect_selfie: true, document_types_and_countries: None}]), RuleActionConfig::ManualReview {} => Ordering::Greater)]
    fn test_rac_cmp(ra1: RuleActionConfig, ra2: RuleActionConfig) -> Ordering {
        ra1.cmp(&ra2)
    }

    #[test_case(RuleInstanceKind::Person, RuleInstanceKind::Any => Ordering::Less)]
    #[test_case(RuleInstanceKind::Business, RuleInstanceKind::Any => Ordering::Less)]
    fn test_rik_cmp(ra1: RuleInstanceKind, ra2: RuleInstanceKind) -> Ordering {
        ra1.cmp(&ra2)
    }

    #[test_case(vec![
        DocumentRequestConfig::Identity {
            collect_selfie: true,
            document_types_and_countries: Some(DocumentAndCountryConfiguration::default()),
        }
    ] => StepUpKind::Identity)]
    #[test_case(vec![
        DocumentRequestConfig::Identity {
            collect_selfie: true,
            document_types_and_countries: Some(DocumentAndCountryConfiguration::default()),
        },
        DocumentRequestConfig::ProofOfSsn {
            requires_human_review: true,
        }
    ] => StepUpKind::IdentityProofOfSsn)]
    #[test_case(vec![
        DocumentRequestConfig::Identity {
            collect_selfie: true,
            document_types_and_countries:  Some(DocumentAndCountryConfiguration::default()),
        },
        DocumentRequestConfig::ProofOfSsn {
            requires_human_review: true,
        },
        DocumentRequestConfig::ProofOfAddress {
            requires_human_review: true,
        }
    ] => StepUpKind::IdentityProofOfSsnProofOfAddress)]
    #[test_case(vec![
        DocumentRequestConfig::ProofOfSsn {
            requires_human_review: true,
        },
        DocumentRequestConfig::ProofOfAddress {
            requires_human_review: true,
        }
    ] => StepUpKind::Custom)]
    #[test_case(vec![
        DocumentRequestConfig::Custom(CustomDocumentConfig{identifier: DataIdentifier::from_str("document.custom.hi").unwrap(), name: "Hi".to_owned(), description: None, requires_human_review: true, upload_settings: DocumentUploadSettings::PreferCapture})
    ] => StepUpKind::Custom)]
    fn test_derive_step_up_kind_from_doc_configs(doc_configs: Vec<DocumentRequestConfig>) -> StepUpKind {
        derive_step_up_kind_from_doc_configs(doc_configs)
    }
}

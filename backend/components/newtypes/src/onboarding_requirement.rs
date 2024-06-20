use crate::CollectedDataOption;
use crate::CustomDocumentConfig;
use crate::DocumentKind;
use crate::DocumentRequestId;
use crate::DocumentRequestKind;
use crate::DocumentUploadMode;
use crate::IdDocKind;
use crate::Iso3166TwoDigitCountryCode;
use chrono::DateTime;
use chrono::Utc;
use itertools::Itertools;
use paperclip::actix::Apiv2Schema;
use std::collections::HashMap;
use std::collections::HashSet;
use strum::EnumDiscriminants;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, EnumDiscriminants)]
#[strum_discriminants(name(OnboardingRequirementKind))]
#[strum_discriminants(derive(strum_macros::Display, strum_macros::EnumIter))]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum OnboardingRequirement {
    /// There is missing identity data that must be collected
    CollectData {
        missing_attributes: Vec<CollectedDataOption>,
        optional_attributes: Vec<CollectedDataOption>,
        populated_attributes: Vec<CollectedDataOption>,
    },
    /// There is missing investor profile data that must be collected
    CollectInvestorProfile {
        missing_attributes: Vec<CollectedDataOption>,
        populated_attributes: Vec<CollectedDataOption>,
        missing_document: bool,
    },
    /// There is missing business data that must be collected
    CollectBusinessData {
        missing_attributes: Vec<CollectedDataOption>,
        populated_attributes: Vec<CollectedDataOption>,
    },
    /// Register a passkey
    #[serde(rename = "liveness")]
    #[strum(to_string = "liveness")]
    #[strum_discriminants(strum(to_string = "liveness"))]
    RegisterPasskey,
    /// A document needs to be collected
    CollectDocument {
        document_request_id: DocumentRequestId,
        upload_mode: DocumentUploadMode,
        config: CollectDocumentConfig,
    },
    /// The client needs to display the authorization consent page and confirm the user authorizes
    /// access
    Authorize {
        fields_to_authorize: AuthorizeFields,
        authorized_at: Option<DateTime<Utc>>,
    },
    /// The client needs to tell us when user input is done in order for us to continue processing
    Process,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum CollectDocumentConfig {
    Identity {
        should_collect_selfie: bool,
        should_collect_consent: bool,
        supported_country_and_doc_types: HashMap<Iso3166TwoDigitCountryCode, Vec<IdDocKind>>,
    },
    ProofOfSsn {},
    ProofOfAddress {},
    Custom(CustomDocumentConfig),
}

impl From<&CollectDocumentConfig> for DocumentRequestKind {
    fn from(value: &CollectDocumentConfig) -> Self {
        match value {
            CollectDocumentConfig::Identity { .. } => Self::Identity,
            CollectDocumentConfig::ProofOfSsn {} => Self::ProofOfSsn,
            CollectDocumentConfig::ProofOfAddress {} => Self::ProofOfAddress,
            CollectDocumentConfig::Custom(_) => Self::Custom,
        }
    }
}

#[derive(Ord, PartialOrd, Eq, PartialEq, Clone, Hash)]
pub struct OnboardingRequirementPriority {
    pub priority: usize,
    /// Tie breaker for custom document requirements
    pub tie_breaker: Option<String>,
}

impl OnboardingRequirement {
    /// Returns an order-able struct that allows sorting requirements by a priority
    pub fn priority(&self, is_doc_first: bool) -> OnboardingRequirementPriority {
        let priority = if !is_doc_first {
            match self {
                OnboardingRequirement::CollectBusinessData { .. } => 0,
                OnboardingRequirement::CollectData { .. } => 1,
                OnboardingRequirement::CollectInvestorProfile { .. } => 2,

                OnboardingRequirement::RegisterPasskey => 3,
                OnboardingRequirement::CollectDocument { config, .. } => match config {
                    CollectDocumentConfig::Identity { .. } => 4,
                    CollectDocumentConfig::ProofOfSsn { .. } => 5,
                    CollectDocumentConfig::ProofOfAddress { .. } => 6,
                    CollectDocumentConfig::Custom(..) => 7,
                },
                OnboardingRequirement::Authorize { .. } => 8,
                OnboardingRequirement::Process => 9,
            }
        } else {
            // For a doc-first config, we show passkey and doc collection first
            match self {
                OnboardingRequirement::RegisterPasskey => 0,
                OnboardingRequirement::CollectDocument { config, .. } => match config {
                    CollectDocumentConfig::Identity { .. } => 1,
                    CollectDocumentConfig::ProofOfSsn { .. } => 2,
                    CollectDocumentConfig::ProofOfAddress { .. } => 3,
                    CollectDocumentConfig::Custom(..) => 4,
                },
                OnboardingRequirement::CollectBusinessData { .. } => 5,
                OnboardingRequirement::CollectData { .. } => 6,
                OnboardingRequirement::CollectInvestorProfile { .. } => 7,

                OnboardingRequirement::Authorize { .. } => 8,
                OnboardingRequirement::Process => 9,
            }
        };
        let tie_breaker = if let OnboardingRequirement::CollectDocument {
            config: CollectDocumentConfig::Custom(CustomDocumentConfig { identifier, .. }),
            ..
        } = self
        {
            Some(identifier.to_string())
        } else {
            None
        };
        OnboardingRequirementPriority {
            priority,
            tie_breaker,
        }
    }
}

impl OnboardingRequirement {
    pub fn is_met(&self) -> bool {
        match self {
            Self::CollectData {
                missing_attributes,
                optional_attributes: _,
                populated_attributes: _,
            } => missing_attributes.is_empty(),
            Self::CollectInvestorProfile {
                missing_attributes,
                missing_document,
                populated_attributes: _,
            } => missing_attributes.is_empty() && !missing_document,
            Self::CollectBusinessData {
                missing_attributes,
                populated_attributes: _,
            } => missing_attributes.is_empty(),
            Self::Authorize {
                fields_to_authorize: _,
                authorized_at,
            } => authorized_at.is_some(),
            // The below requirements only exist when they are unmet, so they are always unmet
            Self::RegisterPasskey => false,
            Self::CollectDocument {
                document_request_id: _,
                upload_mode: _,
                config: _,
            } => false,
            Self::Process => false,
        }
    }

    /// The human-readable error describing why this requirement is unmet
    pub fn unmet_str(&self) -> String {
        match self {
            Self::CollectData {
                missing_attributes: cdos,
                optional_attributes: _,
                populated_attributes: _,
            }
            | Self::CollectInvestorProfile {
                missing_attributes: cdos,
                missing_document: _,
                populated_attributes: _,
            }
            | Self::CollectBusinessData {
                missing_attributes: cdos,
                populated_attributes: _,
            } => format!(
                "Missing {}. At a minimum, the following vault data must be provided: {}",
                cdos.iter().map(|c| c.to_string()).join(", "),
                cdos.iter()
                    .flat_map(|c| c.required_data_identifiers())
                    .map(|c| c.to_string())
                    .join(", ")
            ),
            Self::Authorize {
                fields_to_authorize: _,
                authorized_at: _,
            } => "Onboarding is unauthorized".into(),
            Self::RegisterPasskey => "Missing passkey registration".into(),
            Self::CollectDocument {
                document_request_id: _,
                upload_mode: _,
                config,
            } => format!("Missing {} document", DocumentRequestKind::from(config)),
            Self::Process => "Onboarding pending".into(),
        }
    }

    pub fn is_missing_collect_data_subset(&self, cdos: &[CollectedDataOption]) -> bool {
        let cdos: HashSet<&CollectedDataOption> = HashSet::<&CollectedDataOption>::from_iter(cdos.iter());

        match self {
            Self::CollectData {
                missing_attributes,
                optional_attributes: _,
                populated_attributes: _,
            } => {
                let missing = HashSet::from_iter(missing_attributes.iter());
                missing.is_subset(&cdos)
            }
            _ => false,
        }
    }
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct AuthorizeFields {
    pub collected_data: Vec<CollectedDataOption>,
    pub document_types: Vec<DocumentKind>,
}

#[cfg(test)]
mod test {
    use crate::AuthorizeFields;
    use crate::CollectDocumentConfig;
    use crate::CustomDocumentConfig;
    use crate::DataIdentifier;
    use crate::DocumentRequestId;
    use crate::DocumentRequestKind;
    use crate::DocumentUploadMode;
    use crate::OnboardingRequirement;
    use crate::OnboardingRequirementKind;
    use itertools::Itertools;
    use std::collections::HashMap;
    use std::str::FromStr;
    use strum::IntoEnumIterator;
    use test_case::test_case;

    fn test_requirements() -> Vec<OnboardingRequirement> {
        let mut base = vec![
            OnboardingRequirement::CollectBusinessData {
                missing_attributes: vec![],
                populated_attributes: vec![],
            },
            OnboardingRequirement::CollectData {
                missing_attributes: vec![],
                optional_attributes: vec![],
                populated_attributes: vec![],
            },
            OnboardingRequirement::CollectInvestorProfile {
                missing_attributes: vec![],
                populated_attributes: vec![],
                missing_document: false,
            },
            OnboardingRequirement::RegisterPasskey,
            OnboardingRequirement::Authorize {
                fields_to_authorize: AuthorizeFields {
                    collected_data: vec![],
                    document_types: vec![],
                },
                authorized_at: None,
            },
            OnboardingRequirement::Process,
        ];

        // add doc reqs in
        for dr_kind in DocumentRequestKind::iter() {
            base.push(OnboardingRequirement::CollectDocument {
                document_request_id: DocumentRequestId::from_str("dr12").unwrap(),
                upload_mode: DocumentUploadMode::AllowUpload,
                config: match dr_kind {
                    DocumentRequestKind::Identity => CollectDocumentConfig::Identity {
                        should_collect_selfie: false,
                        should_collect_consent: false,
                        supported_country_and_doc_types: HashMap::new(),
                    },
                    DocumentRequestKind::ProofOfSsn => CollectDocumentConfig::ProofOfSsn {},
                    DocumentRequestKind::ProofOfAddress => CollectDocumentConfig::ProofOfAddress {},
                    DocumentRequestKind::Custom => CollectDocumentConfig::Custom(CustomDocumentConfig {
                        identifier: DataIdentifier::from_str("document.custom.flerp").unwrap(),
                        name: "Flerp".to_string(),
                        description: None,
                    }),
                },
            });
        }

        base
    }

    #[test_case(true)]
    #[test_case(false)]
    fn test_priority(is_doc_first: bool) {
        let expected_len = OnboardingRequirementKind::iter().len() + DocumentRequestKind::iter().len() - 1;
        // Make sure each requirement has its own unique priority
        assert_eq!(
            test_requirements()
                .into_iter()
                .map(|i| i.priority(is_doc_first))
                .unique()
                .count(),
            expected_len
        )
    }
}

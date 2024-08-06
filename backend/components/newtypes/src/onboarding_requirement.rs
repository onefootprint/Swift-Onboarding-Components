use crate::AuthMethodKind;
use crate::CollectedDataOption;
use crate::CustomDocumentConfig;
use crate::DocumentKind;
use crate::DocumentRequestId;
use crate::DocumentRequestKind;
use crate::DocumentUploadSettings;
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
    RegisterAuthMethod {
        auth_method_kind: AuthMethodKind,
    },
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
    // Could eventually consolidate with RegisterAuthMethod, but that has different semantics in that it's
    // unable to be skipped
    RegisterPasskey,
    /// A document needs to be collected
    CollectDocument {
        document_request_id: DocumentRequestId,
        config: CollectDocumentConfig,
        upload_settings: DocumentUploadSettings,
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
                OnboardingRequirement::RegisterAuthMethod { .. } => 0,
                OnboardingRequirement::CollectBusinessData { .. } => 1,
                OnboardingRequirement::CollectData { .. } => 2,
                OnboardingRequirement::CollectInvestorProfile { .. } => 3,

                OnboardingRequirement::RegisterPasskey => 4,
                OnboardingRequirement::CollectDocument { config, .. } => match config {
                    CollectDocumentConfig::Identity { .. } => 5,
                    CollectDocumentConfig::ProofOfSsn { .. } => 6,
                    CollectDocumentConfig::ProofOfAddress { .. } => 7,
                    CollectDocumentConfig::Custom(..) => 8,
                },
                OnboardingRequirement::Authorize { .. } => 9,
                OnboardingRequirement::Process => 10,
            }
        } else {
            // For a doc-first config, we show passkey and doc collection first
            match self {
                OnboardingRequirement::RegisterAuthMethod { .. } => 0,
                OnboardingRequirement::RegisterPasskey => 1,
                OnboardingRequirement::CollectDocument { config, .. } => match config {
                    CollectDocumentConfig::Identity { .. } => 2,
                    CollectDocumentConfig::ProofOfSsn { .. } => 3,
                    CollectDocumentConfig::ProofOfAddress { .. } => 4,
                    CollectDocumentConfig::Custom(..) => 5,
                },
                OnboardingRequirement::CollectBusinessData { .. } => 6,
                OnboardingRequirement::CollectData { .. } => 7,
                OnboardingRequirement::CollectInvestorProfile { .. } => 8,

                OnboardingRequirement::Authorize { .. } => 9,
                OnboardingRequirement::Process => 10,
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
            Self::RegisterAuthMethod { .. } => false,
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
                upload_settings: _,
                config: _,
            } => false,
            Self::Process => false,
        }
    }

    /// The human-readable error describing why this requirement is unmet
    pub fn unmet_str(&self) -> String {
        match self {
            Self::RegisterAuthMethod { auth_method_kind } => {
                format!("Requires registering {} as an auth method", auth_method_kind)
            }
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
                upload_settings: _,
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
    use crate::AuthMethodKind;
    use crate::AuthorizeFields;
    use crate::CollectDocumentConfig;
    use crate::CustomDocumentConfig;
    use crate::DataIdentifier;
    use crate::DocumentRequestId;
    use crate::DocumentRequestKind;
    use crate::DocumentUploadSettings;
    use crate::OnboardingRequirement;
    use crate::OnboardingRequirementKind;
    use itertools::Itertools;
    use std::collections::HashMap;
    use std::str::FromStr;
    use strum::IntoEnumIterator;
    use test_case::test_case;

    fn test_requirements() -> Vec<OnboardingRequirement> {
        let mut base = vec![
            OnboardingRequirement::RegisterAuthMethod {
                auth_method_kind: AuthMethodKind::Email,
            },
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
                upload_settings: DocumentUploadSettings::PreferUpload,
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
                        requires_human_review: true,
                        upload_settings: DocumentUploadSettings::PreferUpload,
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

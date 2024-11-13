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

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, EnumDiscriminants, derive_more::IsVariant)]
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
        recollect_attributes: Vec<CollectedDataOption>,
    },
    /// There is missing investor profile data that must be collected
    CollectInvestorProfile {
        missing_attributes: Vec<CollectedDataOption>,
        populated_attributes: Vec<CollectedDataOption>,
        missing_document: bool,
    },
    /// The flow requires a business, and one hasn't yet been created / selected
    CreateBusinessOnboarding {
        /// When true, requires either selecting an existing business, or will create a new one upon
        /// `POST /hosted/business/onboarding`.
        /// When false, there's already a business associated with this session, so we can
        /// immediately call `POST /hosted/business/onboarding`.
        requires_business_selection: bool,
    },
    /// There is missing business data that must be collected
    CollectBusinessData {
        missing_attributes: Vec<CollectedDataOption>,
        populated_attributes: Vec<CollectedDataOption>,
        recollect_attributes: Vec<CollectedDataOption>,
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

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, derive_more::IsVariant)]
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
/// Orderable struct that allows sorting onboarding requirements by priorty. The requirements will
/// be sorted in ascending order, with the first requirement being the highest priority.
pub struct OnboardingRequirementPriority {
    pub priority: usize,
    /// Tie breaker for document requirements
    pub document_priority: Option<DocumentPriority>,
}

#[derive(Ord, PartialOrd, Eq, PartialEq, Clone, Hash)]
/// Orderable struct that allows sorting CollectDocumentConfigs by priorty. The requirements will be
/// sorted in ascending order, with the first requirement being the highest priority.
pub struct DocumentPriority {
    pub priority: usize,
    /// Tie breaker for custom document requirements
    pub tie_breaker: Option<String>,
}

impl CollectDocumentConfig {
    fn document_priority(&self) -> DocumentPriority {
        let priority = match self {
            Self::Identity { .. } => 0,
            Self::ProofOfSsn { .. } => 1,
            Self::ProofOfAddress { .. } => 2,
            Self::Custom(..) => 3,
        };
        let tie_breaker = if let Self::Custom(CustomDocumentConfig { identifier, .. }) = self {
            Some(identifier.to_string())
        } else {
            None
        };
        DocumentPriority {
            priority,
            tie_breaker,
        }
    }
}

impl OnboardingRequirement {
    /// Returns an order-able struct that allows sorting requirements by a priority
    pub fn priority(&self, is_doc_first: bool) -> OnboardingRequirementPriority {
        let priority = match self {
            Self::RegisterAuthMethod { .. } => 0,

            // Special case: show ID doc requirements before collecting data if we're in a doc-first flow.
            // While we're doing this, we'll also handle the passkey requirement since we'll already be
            // transferred to mobile.
            Self::RegisterPasskey if is_doc_first => 1,
            Self::CollectDocument { config, .. } if is_doc_first && config.is_identity() => 2,

            Self::CreateBusinessOnboarding { .. } => 3,
            Self::CollectBusinessData { .. } => 4,
            Self::CollectData { .. } => 5,
            Self::CollectInvestorProfile { .. } => 6,
            Self::RegisterPasskey => 7,
            Self::CollectDocument { .. } => 8,
            Self::Authorize { .. } => 9,
            Self::Process => 10,
        };

        let document_priority = self.collect_document_config().map(|c| c.document_priority());

        OnboardingRequirementPriority {
            priority,
            document_priority,
        }
    }

    fn collect_document_config(&self) -> Option<&CollectDocumentConfig> {
        if let OnboardingRequirement::CollectDocument { config, .. } = self {
            Some(config)
        } else {
            None
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
                recollect_attributes: _,
            } => missing_attributes.is_empty(),
            Self::CollectInvestorProfile {
                missing_attributes,
                missing_document,
                populated_attributes: _,
            } => missing_attributes.is_empty() && !missing_document,
            Self::CreateBusinessOnboarding {
                requires_business_selection: _,
            } => false,
            Self::CollectBusinessData {
                missing_attributes,
                populated_attributes: _,
                recollect_attributes: _,
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
                recollect_attributes: _,
            }
            | Self::CollectInvestorProfile {
                missing_attributes: cdos,
                missing_document: _,
                populated_attributes: _,
            }
            | Self::CollectBusinessData {
                missing_attributes: cdos,
                populated_attributes: _,
                recollect_attributes: _,
            } => {
                let required_dis = cdos
                    .iter()
                    .flat_map(|c| c.required_data_identifiers())
                    .map(|c| c.to_string())
                    .join(", ");
                let required_dis_str = if required_dis.is_empty() {
                    "".to_string()
                } else {
                    format!(
                        " At a minimum, the following vault data must be provided: {}",
                        required_dis
                    )
                };
                let cdos_str = cdos.iter().map(|c| c.to_string()).join(", ");
                format!("Missing {}.{}", cdos_str, required_dis_str)
            }
            Self::CreateBusinessOnboarding {
                requires_business_selection: _,
            } => "Missing business onboarding".into(),
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
                recollect_attributes: _,
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

#[derive(derive_more::Into)]
pub struct OrderedOnboardingRequirements(Vec<OnboardingRequirement>);

impl OrderedOnboardingRequirements {
    pub fn from_unordered(requirements: Vec<OnboardingRequirement>, is_doc_first: bool) -> Self {
        let requirements = requirements
            .into_iter()
            .sorted_by_key(|r| r.priority(is_doc_first))
            .collect_vec();
        Self(requirements)
    }
}

impl IntoIterator for OrderedOnboardingRequirements {
    type IntoIter = std::vec::IntoIter<Self::Item>;
    type Item = OnboardingRequirement;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
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
    use crate::OrderedOnboardingRequirements;
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
            OnboardingRequirement::CreateBusinessOnboarding {
                requires_business_selection: true,
            },
            OnboardingRequirement::CollectBusinessData {
                missing_attributes: vec![],
                populated_attributes: vec![],
                recollect_attributes: vec![],
            },
            OnboardingRequirement::CollectData {
                missing_attributes: vec![],
                optional_attributes: vec![],
                populated_attributes: vec![],
                recollect_attributes: vec![],
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
    fn test_unique_priority(is_doc_first: bool) {
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

    #[test]
    fn test_priority() {
        let mut requirements = OrderedOnboardingRequirements::from_unordered(test_requirements(), false)
            .into_iter()
            .rev()
            .collect_vec();
        let mut next_req = || requirements.pop().unwrap();

        assert!(next_req().is_register_auth_method());
        assert!(next_req().is_create_business_onboarding());
        assert!(next_req().is_collect_business_data());
        assert!(next_req().is_collect_data());
        assert!(next_req().is_collect_investor_profile());
        assert!(next_req().is_register_passkey());

        assert!(next_req()
            .collect_document_config()
            .is_some_and(|c| c.is_identity()));
        assert!(next_req()
            .collect_document_config()
            .is_some_and(|c| c.is_proof_of_ssn()));
        assert!(next_req()
            .collect_document_config()
            .is_some_and(|c| c.is_proof_of_address()));
        assert!(next_req()
            .collect_document_config()
            .is_some_and(|c| c.is_custom()));

        assert!(next_req().is_authorize());
        assert!(next_req().is_process());
    }

    #[test]
    fn test_priority_doc_first() {
        let mut requirements = OrderedOnboardingRequirements::from_unordered(test_requirements(), true)
            .into_iter()
            .rev()
            .collect_vec();
        let mut next_req = || requirements.pop().unwrap();

        assert!(next_req().is_register_auth_method());
        assert!(next_req().is_register_passkey());
        assert!(next_req()
            .collect_document_config()
            .is_some_and(|c| c.is_identity()));

        assert!(next_req().is_create_business_onboarding());
        assert!(next_req().is_collect_business_data());
        assert!(next_req().is_collect_data());
        assert!(next_req().is_collect_investor_profile());

        assert!(next_req()
            .collect_document_config()
            .is_some_and(|c| c.is_proof_of_ssn()));
        assert!(next_req()
            .collect_document_config()
            .is_some_and(|c| c.is_proof_of_address()));
        assert!(next_req()
            .collect_document_config()
            .is_some_and(|c| c.is_custom()));

        assert!(next_req().is_authorize());
        assert!(next_req().is_process());
    }
}

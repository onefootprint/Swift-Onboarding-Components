use std::collections::HashMap;

use crate::{
    CollectedDataOption, DocumentRequestId, DocumentRequestKind, DocumentUploadMode, IdDocKind,
    Iso3166TwoDigitCountryCode,
};
use chrono::{DateTime, Utc};
use paperclip::actix::Apiv2Schema;

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
        should_collect_selfie: bool,
        should_collect_consent: bool,
        supported_country_and_doc_types: HashMap<Iso3166TwoDigitCountryCode, Vec<IdDocKind>>,
        upload_mode: DocumentUploadMode,
        document_request_kind: DocumentRequestKind,
    },
    /// The client needs to display the authorization consent page and confirm the user authorizes access
    Authorize {
        fields_to_authorize: AuthorizeFields,
        authorized_at: Option<DateTime<Utc>>,
    },
    /// The client needs to tell us when user input is done in order for us to continue processing
    Process,
}


impl OnboardingRequirement {
    pub fn priority(&self, is_doc_first: bool) -> usize {
        if !is_doc_first {
            match self {
                OnboardingRequirement::CollectBusinessData { .. } => 0,
                OnboardingRequirement::CollectData { .. } => 1,
                OnboardingRequirement::CollectInvestorProfile { .. } => 2,

                OnboardingRequirement::RegisterPasskey => 3,
                OnboardingRequirement::CollectDocument {
                    document_request_kind,
                    ..
                } => match document_request_kind {
                    DocumentRequestKind::Identity => 4,
                    DocumentRequestKind::ProofOfSsn => 5,
                    DocumentRequestKind::ProofOfAddress => 6,
                },
                OnboardingRequirement::Authorize { .. } => 7,
                OnboardingRequirement::Process => 8,
            }
        } else {
            // For a doc-first config, we show passkey and doc collection first
            match self {
                OnboardingRequirement::RegisterPasskey => 0,
                OnboardingRequirement::CollectDocument {
                    document_request_kind,
                    ..
                } => match document_request_kind {
                    DocumentRequestKind::Identity => 1,
                    DocumentRequestKind::ProofOfSsn => 2,
                    DocumentRequestKind::ProofOfAddress => 3,
                },
                OnboardingRequirement::CollectBusinessData { .. } => 4,
                OnboardingRequirement::CollectData { .. } => 5,
                OnboardingRequirement::CollectInvestorProfile { .. } => 6,

                OnboardingRequirement::Authorize { .. } => 7,
                OnboardingRequirement::Process => 8,
            }
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
                should_collect_consent: _,
                should_collect_selfie: _,
                supported_country_and_doc_types: _,
                upload_mode: _,
                document_request_kind: _,
            } => false,
            Self::Process => false,
        }
    }
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct AuthorizeFields {
    pub collected_data: Vec<CollectedDataOption>,
    pub document_types: Vec<IdDocKind>,
}

#[cfg(test)]
mod test {
    use std::{collections::HashMap, str::FromStr};

    use crate::{
        AuthorizeFields, DocumentRequestId, DocumentRequestKind, DocumentUploadMode, OnboardingRequirement,
        OnboardingRequirementKind,
    };
    use itertools::Itertools;
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
                should_collect_selfie: false,
                should_collect_consent: false,
                supported_country_and_doc_types: HashMap::new(),
                upload_mode: DocumentUploadMode::AllowUpload,
                document_request_kind: dr_kind,
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

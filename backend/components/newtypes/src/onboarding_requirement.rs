use std::collections::HashMap;

use crate::{CollectedDataOption, DocumentRequestId, IdDocKind, Iso3166TwoDigitCountryCode};
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
    },
    /// Uses the same struct as CollectDocument in practice
    CollectProofOfSsn,
    /// The client needs to display the authorization consent page and confirm the user authorizes access
    Authorize {
        fields_to_authorize: AuthorizeFields,
        authorized_at: Option<DateTime<Utc>>,
    },
    /// The client needs to tell us when user input is done in order for us to continue processing
    Process,
}

impl OnboardingRequirementKind {
    pub fn priority(&self, is_doc_first: bool) -> usize {
        if !is_doc_first {
            match self {
                Self::CollectBusinessData => 0,
                Self::CollectData => 1,
                Self::CollectInvestorProfile => 2,
                Self::RegisterPasskey => 3,
                Self::CollectDocument => 4,
                Self::CollectProofOfSsn => 5,
                Self::Authorize => 6,
                Self::Process => 7,
            }
        } else {
            // For a doc-first config, we show passkey and doc collection first
            match self {
                Self::RegisterPasskey => 0,
                Self::CollectDocument => 1,
                Self::CollectProofOfSsn => 2,
                Self::CollectBusinessData => 3,
                Self::CollectData => 4,
                Self::CollectInvestorProfile => 5,
                Self::Authorize => 6,
                Self::Process => 7,
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
            } => false,
            Self::CollectProofOfSsn => false,
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
    use crate::OnboardingRequirementKind;
    use itertools::Itertools;
    use strum::IntoEnumIterator;
    use test_case::test_case;

    #[test_case(true)]
    #[test_case(false)]
    fn test_priority(is_doc_first: bool) {
        // Make sure each requirement has its own unique priority
        assert_eq!(
            OnboardingRequirementKind::iter()
                .map(|i| i.priority(is_doc_first))
                .unique()
                .count(),
            OnboardingRequirementKind::iter().len()
        )
    }
}

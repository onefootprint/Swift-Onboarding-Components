use newtypes::{CollectedDataOption, DocumentRequestId, IdDocKind};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use strum::EnumDiscriminants;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, EnumDiscriminants, JsonSchema)]
#[strum_discriminants(name(OnboardingRequirementDiscriminant))]
#[strum_discriminants(derive(strum_macros::Display))]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum OnboardingRequirement {
    /// There is missing identity data that must be collected
    CollectData {
        missing_attributes: Vec<CollectedDataOption>,
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
    /// Perform liveness checks
    Liveness,
    CollectDocument {
        document_request_id: DocumentRequestId,
        should_collect_selfie: bool,
        should_collect_consent: bool,
    },
    Authorize {
        fields_to_authorize: AuthorizeFields,
    },
}

impl OnboardingRequirement {
    pub fn is_met(&self) -> bool {
        match self {
            Self::CollectData {
                missing_attributes,
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
            // The below requirements only exist when they are unmet, so they are always unmet
            Self::Liveness => false,
            Self::CollectDocument {
                document_request_id: _,
                should_collect_consent: _,
                should_collect_selfie: _,
            } => false,
            Self::Authorize {
                fields_to_authorize: _,
            } => false,
        }
    }
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, JsonSchema)]
pub struct AuthorizeFields {
    pub collected_data: Vec<CollectedDataOption>,
    pub identity_document_types: Vec<IdDocKind>,
}

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
    },
    /// There is missing investor profile data that must be collected
    CollectInvestorProfile {
        missing_attributes: Vec<CollectedDataOption>,
    },
    /// There is missing business data that must be collected
    CollectBusinessData {
        missing_attributes: Vec<CollectedDataOption>,
    },
    /// Perform liveness checks
    Liveness,
    /// The KYC checks have not yet been initiated for the user's data
    IdentityCheck,
    CollectDocument {
        document_request_id: DocumentRequestId,
        should_collect_selfie: bool,
        should_collect_consent: bool,
    },
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, JsonSchema)]
pub struct AuthorizeFields {
    pub collected_data: Vec<CollectedDataOption>,
    pub identity_document_types: Vec<IdDocKind>,
    pub selfie_collected: bool,
}

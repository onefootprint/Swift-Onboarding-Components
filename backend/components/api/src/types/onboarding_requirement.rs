use newtypes::{CollectedDataOption, DocumentRequestId};
use paperclip::actix::Apiv2Schema;
use strum::EnumDiscriminants;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, EnumDiscriminants)]
#[strum_discriminants(name(OnboardingRequirementDiscriminant))]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum OnboardingRequirement {
    /// There is missing data that must be collected
    CollectData {
        missing_attributes: Vec<CollectedDataOption>,
    },
    /// Perform liveness checks
    Liveness,
    /// The KYC checks have not yet been initiated for the user's data
    IdentityCheck,
    CollectDocument {
        document_request_id: DocumentRequestId,
    },
}

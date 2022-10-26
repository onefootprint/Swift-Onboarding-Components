use newtypes::{CollectedDataOption, DocumentRequestId};
use paperclip::actix::Apiv2Schema;
use strum::EnumDiscriminants;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, EnumDiscriminants)]
#[strum_discriminants(name(OnboardingRequirementDiscriminant))]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum OnboardingRequirement {
    IdentityCheck {
        missing_attributes: Vec<CollectedDataOption>,
    },
    Liveness,
    // TODO(argoff) add `DocumentRequestReason` here once we add it to the DocumentRequest table
    CollectDocument {
        document_request_id: DocumentRequestId,
    },
}

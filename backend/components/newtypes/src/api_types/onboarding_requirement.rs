use paperclip::actix::Apiv2Schema;

use crate::CollectedDataOption;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum OnboardingRequirement {
    IdentityCheck {
        missing_attributes: Vec<CollectedDataOption>,
    },
    Liveness,
    CollectDocument, // TODO
}

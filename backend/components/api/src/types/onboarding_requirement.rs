use db::models::requirement::Requirement;
use newtypes::{CollectedDataOption, DocumentRequestId};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
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

impl From<Requirement> for OnboardingRequirement {
    fn from(_: Requirement) -> Self {
        todo!()
    }
}

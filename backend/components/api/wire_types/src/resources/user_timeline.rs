use newtypes::CollectedDataOption;

use crate::{
    Actor, Annotation, Apiv2Schema, DateTime, IdentityDocumentTimelineEvent, LivenessEvent,
    OnboardingDecision, Serialize, Utc, VaultCreated, WatchlistCheck, Workflow,
};

/// Describes a liveness event that took place
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct UserTimeline {
    pub event: UserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub is_from_other_org: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
#[allow(clippy::large_enum_variant)]
pub enum UserTimelineEvent {
    DataCollected(DataCollectedInfo),
    Liveness(LivenessEvent),
    IdentityDocumentUploaded(IdentityDocumentTimelineEvent),
    OnboardingDecision {
        decision: OnboardingDecision,
        annotation: Option<Annotation>,
    },
    Annotation(Annotation),
    WatchlistCheck(WatchlistCheck),
    VaultCreated(VaultCreated),
    WorkflowTriggered(WorkflowTriggered),
}

#[derive(Debug, Clone, Serialize)]
pub struct DataCollectedInfo {
    pub attributes: Vec<CollectedDataOption>,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkflowTriggered {
    pub workflow: Workflow,
    pub actor: Actor,
}

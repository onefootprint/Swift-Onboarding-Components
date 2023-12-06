use newtypes::CollectedDataOption;

use crate::{
    Actor, Annotation, Apiv2Schema, DateTime, IdentityDocumentTimelineEvent, LivenessEvent,
    OnboardingDecision, Serialize, TimelinePlaybook, TriggeredWorkflow, Utc, VaultCreated, WatchlistCheck,
    WorkflowRequest,
};

/// Describes a liveness event that took place
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct UserTimeline {
    pub event: UserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub is_from_other_org: bool,
}

// TODO need Apiv2Schema to generate the oneOf type. Paperclip doesn't support this though...
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
    WorkflowStarted(WorkflowStarted),
}

#[derive(Debug, Clone, Serialize)]
pub struct DataCollectedInfo {
    /// The list of CDOs that had a DI that was edited
    pub attributes: Vec<CollectedDataOption>,
    pub actor: Option<Actor>,
    /// True when the data added in this timeline event was added via a one-click onboarding
    pub is_prefill: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkflowTriggered {
    pub workflow: TriggeredWorkflow,
    pub request: Option<WorkflowRequest>,
    pub actor: Actor,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkflowStarted {
    pub playbook: TimelinePlaybook,
}

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
}

#[derive(Debug, Clone, Serialize)]
pub struct DataCollectedInfo {
    // TODO this isn't really the full picture, we should start storing `Vec<DI>` really...
    pub attributes: Vec<CollectedDataOption>,
    pub actor: Option<Actor>,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkflowTriggered {
    pub workflow: Workflow,
    pub actor: Actor,
}

use newtypes::CollectedDataOption;

use crate::{
    export_schema, Actor, Annotation, Apiv2Schema, DateTime, IdentityDocumentTimelineEvent, JsonSchema,
    LivenessEvent, OnboardingDecision, Serialize, Utc, VaultCreated, WatchlistCheck, Workflow,
};

/// Describes a liveness event that took place
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct UserTimeline {
    pub event: UserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub is_from_other_org: bool,
}

export_schema!(UserTimeline);

#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
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
export_schema!(UserTimelineEvent);

#[derive(Debug, Clone, Serialize, JsonSchema)]
pub struct DataCollectedInfo {
    pub attributes: Vec<CollectedDataOption>,
}

export_schema!(DataCollectedInfo);

#[derive(Debug, Clone, Serialize, JsonSchema)]
pub struct WorkflowTriggered {
    pub workflow: Workflow,
    pub actor: Actor,
}

export_schema!(WorkflowTriggered);

use crate::{
    Actor,
    Annotation,
    Apiv2Schema,
    DateTime,
    DocumentRequest,
    DocumentUploadedTimelineEvent,
    InsightEvent,
    LivenessEvent,
    OnboardingDecision,
    Serialize,
    TimelinePlaybook,
    Utc,
    VaultCreated,
    WatchlistCheck,
};
use newtypes::{
    ActionKind,
    AuthMethodKind,
    CollectedDataOption,
    DataIdentifier,
    DataLifetimeSeqno,
    ExternalIntegrationKind,
    LabelKind,
    WorkflowRequestConfig,
};
use serde::Deserialize;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct UserTimeline {
    pub event: UserTimelineEvent,
    pub seqno: DataLifetimeSeqno,
    pub timestamp: DateTime<Utc>,
}

// TODO need Apiv2Schema to generate the oneOf type. Paperclip doesn't support this though...
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
#[allow(clippy::large_enum_variant)]
pub enum UserTimelineEvent {
    DataCollected(DataCollectedInfo),
    Liveness(LivenessEvent),
    DocumentUploaded(DocumentUploadedTimelineEvent),
    OnboardingDecision {
        decision: OnboardingDecision,
        annotation: Option<Annotation>,
    },
    Annotation(Annotation),
    WatchlistCheck(WatchlistCheck),
    VaultCreated(VaultCreated),
    WorkflowTriggered(WorkflowTriggered),
    WorkflowStarted(WorkflowStarted),
    AuthMethodUpdated(AuthMethodUpdated),
    LabelAdded(LabelAdded),
    ExternalIntegrationCalled(ExternalIntegrationCalled),
    StepUp(Vec<DocumentRequest>),
    OnboardingTimeline(OnboardingTimelineInfo),
}

#[derive(Debug, Clone, Serialize)]
pub struct DataCollectedInfo {
    /// The list of CDOs that had a DI that was edited
    pub attributes: Vec<CollectedDataOption>,
    pub targets: Vec<DataIdentifier>,
    pub actor: Option<Actor>,
    /// True when the data added in this timeline event was added via a one-click onboarding
    pub is_prefill: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkflowTriggered {
    pub request_is_active: bool,
    pub config: WorkflowRequestConfig,
    pub actor: Actor,
    pub note: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkflowStarted {
    pub kind: WorkflowStartedEventKind,
    pub playbook: TimelinePlaybook,
}

#[derive(Debug, Clone, Serialize)]
pub struct AuthMethodUpdated {
    pub kind: AuthMethodKind,
    pub action: ActionKind,
    pub insight_event: InsightEvent,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkflowStartedEventKind {
    /// Onboarding onto an existing playbook
    Playbook,
    /// Collecting documents
    Document,
}

#[derive(Debug, Clone, Serialize)]
pub struct LabelAdded {
    pub kind: LabelKind,
}

#[derive(Debug, Clone, Serialize)]
pub struct ExternalIntegrationCalled {
    pub integration: ExternalIntegrationKind,
    pub successful: bool,
    pub external_id: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct OnboardingTimelineInfo {
    pub event: String,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct CreateOnboardingTimelineRequest {
    pub event: String,
}

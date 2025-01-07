use crate::Actor;
use crate::Annotation;
use crate::Apiv2Response;
use crate::Apiv2Schema;
use crate::DateTime;
use crate::DocumentRequest;
use crate::DocumentUploadedTimelineEvent;
use crate::InsightEvent;
use crate::LivenessEvent;
use crate::Serialize;
use crate::TimelineOnboardingDecision;
use crate::TimelinePlaybook;
use crate::Utc;
use crate::VaultCreated;
use crate::WatchlistCheck;
use newtypes::ActionKind;
use newtypes::AuthMethodKind;
use newtypes::CollectedDataOption;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::ExternalIntegrationKind;
use newtypes::FpId;
use newtypes::LabelKind;
use newtypes::WorkflowRequestConfig;
use newtypes::WorkflowSource;
use serde::Deserialize;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct UserTimeline {
    pub event: UserTimelineEvent,
    pub seqno: DataLifetimeSeqno,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
#[allow(clippy::large_enum_variant)]
pub enum UserTimelineEvent {
    DataCollected(DataCollectedInfo),
    Liveness(LivenessEvent),
    DocumentUploaded(DocumentUploadedTimelineEvent),
    OnboardingDecision {
        decision: TimelineOnboardingDecision,
        annotation: Option<Annotation>,
        workflow_source: WorkflowSource,
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
    BusinessOwnerCompletedKyc {
        fp_id: FpId,
        decision: TimelineOnboardingDecision,
    },
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct DataCollectedInfo {
    /// The list of CDOs that had a DI that was edited
    pub attributes: Vec<CollectedDataOption>,
    pub targets: Vec<DataIdentifier>,
    pub actor: Option<Actor>,
    /// True when the data added in this timeline event was added via a one-click onboarding
    pub is_prefill: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct WorkflowTriggered {
    pub request_is_active: bool,
    pub config: WorkflowRequestConfig,
    pub actor: Actor,
    pub note: Option<String>,
    /// Only not populated for legacy events
    pub fp_id: Option<FpId>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct WorkflowStarted {
    pub kind: WorkflowStartedEventKind,
    pub playbook: TimelinePlaybook,
    pub workflow_source: WorkflowSource,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct AuthMethodUpdated {
    pub kind: AuthMethodKind,
    pub action: ActionKind,
    pub insight_event: InsightEvent,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum WorkflowStartedEventKind {
    /// Onboarding onto an existing playbook
    Playbook,
    /// Collecting documents
    Document,
    /// Adhoc vendor call
    Adhoc,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct LabelAdded {
    pub kind: LabelKind,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct ExternalIntegrationCalled {
    pub integration: ExternalIntegrationKind,
    pub successful: bool,
    pub external_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct OnboardingTimelineInfo {
    pub event: String,
    pub session_id: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct CreateOnboardingTimelineRequest {
    pub event: String,
}

use crate::util::impl_enum_string_diesel;
use crate::{
    ActionKind,
    AnnotationId,
    AuthEventId,
    AuthMethodKind,
    CollectedDataOption,
    DataIdentifier,
    DbActor,
    DocumentId,
    DocumentRequestId,
    LabelId,
    LivenessEventId,
    ObConfigurationId,
    OnboardingDecisionId,
    WatchlistCheckId,
    WebauthnCredentialId,
    WorkflowId,
    WorkflowRequestId,
};
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum::{
    Display,
    EnumDiscriminants,
};

#[derive(
    Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb, EnumDiscriminants, derive_more::From,
)]
#[strum_discriminants(name(DbUserTimelineEventKind))]
#[strum_discriminants(derive(
    Apiv2Schema,
    DeserializeFromStr,
    SerializeDisplay,
    Display,
    strum_macros::EnumString,
    AsExpression,
    FromSqlRow,
))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[strum_discriminants(diesel(sql_type = Text))]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum DbUserTimelineEvent {
    DataCollected(DataCollectedInfo),
    #[serde(rename = "identity_document_uploaded")]
    #[strum_discriminants(strum(serialize = "identity_document_uploaded"))]
    DocumentUploaded(DocumentUploadedInfo),
    OnboardingDecision(OnboardingDecisionInfo),
    Liveness(LivenessInfo),
    Annotation(AnnotationInfo),
    WatchlistCheck(WatchlistCheckInfo),
    VaultCreated(VaultCreatedInfo),
    WorkflowTriggered(WorkflowTriggeredInfo),
    WorkflowStarted(WorkflowStartedInfo),
    AuthMethodUpdated(AuthMethodUpdatedInfo),
    LabelAdded(LabelAddedInfo),
    ExternalIntegrationCalled(ExternalIntegrationInfo),
    StepUp(StepUpInfo),
    /// Client-provided events as the user is moving through pages
    OnboardingTimeline(OnboardingTimelineInfo),
}

impl_enum_string_diesel!(DbUserTimelineEventKind);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataCollectedInfo {
    pub attributes: Vec<CollectedDataOption>,
    #[serde(default)]
    /// This was added more recently since CDOs aren't fully representative when incomplete CDOs
    /// were added.
    /// Going to keep `attributes` around for now because I don't want to backfill these timeline
    /// events...
    pub targets: Vec<DataIdentifier>,
    pub actor: Option<DbActor>,
    #[serde(default)]
    pub is_prefill: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BiometricRegisteredInfo {
    pub id: WebauthnCredentialId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentUploadedInfo {
    pub id: DocumentId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnboardingDecisionInfo {
    pub id: OnboardingDecisionId,
    pub annotation_id: Option<AnnotationId>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LivenessInfo {
    pub id: LivenessEventId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnnotationInfo {
    pub annotation_id: AnnotationId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchlistCheckInfo {
    pub id: WatchlistCheckId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultCreatedInfo {
    pub actor: DbActor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowTriggeredInfo {
    /// Old format when triggers would create Workflows inline
    pub workflow_id: Option<WorkflowId>,
    /// New format when triggers simply reonboard to a playbook
    pub ob_config_id: Option<ObConfigurationId>,
    /// Newer format when triggers make a WorkflowRequest
    pub workflow_request_id: Option<WorkflowRequestId>,
    pub actor: DbActor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStartedInfo {
    pub workflow_id: WorkflowId,
    pub pb_id: ObConfigurationId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthMethodUpdatedInfo {
    pub kind: AuthMethodKind,
    pub action: ActionKind,
    pub auth_event_id: AuthEventId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LabelAddedInfo {
    pub id: LabelId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ExternalIntegrationKind {
    AlpacaCip,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalIntegrationInfo {
    pub integration: ExternalIntegrationKind,
    pub successful: bool,
    pub external_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepUpInfo {
    pub document_request_ids: Vec<DocumentRequestId>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnboardingTimelineInfo {
    pub event: String,
}

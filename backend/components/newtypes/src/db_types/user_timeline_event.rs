use crate::{
    util::impl_enum_string_diesel, AnnotationId, CollectedDataOption, IdentityDocumentId, LivenessEventId,
    OnboardingDecisionId, WatchlistCheckId, WebauthnCredentialId,
};
use crate::{DbActor, WorkflowId};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::Display;
use strum::EnumDiscriminants;

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb, EnumDiscriminants)]
#[strum_discriminants(name(DbUserTimelineEventKind))]
#[strum_discriminants(derive(
    Apiv2Schema,
    DeserializeFromStr,
    SerializeDisplay,
    Display,
    strum_macros::EnumString,
    AsExpression,
    FromSqlRow,
    JsonSchema,
))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[strum_discriminants(diesel(sql_type = Text))]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum DbUserTimelineEvent {
    DataCollected(DataCollectedInfo),
    IdentityDocumentUploaded(IdentityDocumentUploadedInfo),
    OnboardingDecision(OnboardingDecisionInfo),
    Liveness(LivenessInfo),
    Annotation(AnnotationInfo),
    WatchlistCheck(WatchlistCheckInfo),
    VaultCreated(VaultCreatedInfo),
    WorkflowTriggered(WorkflowTriggeredInfo),
}

impl_enum_string_diesel!(DbUserTimelineEventKind);

impl From<DataCollectedInfo> for DbUserTimelineEvent {
    fn from(s: DataCollectedInfo) -> Self {
        Self::DataCollected(s)
    }
}

impl From<IdentityDocumentUploadedInfo> for DbUserTimelineEvent {
    fn from(s: IdentityDocumentUploadedInfo) -> Self {
        Self::IdentityDocumentUploaded(s)
    }
}

impl From<OnboardingDecisionInfo> for DbUserTimelineEvent {
    fn from(s: OnboardingDecisionInfo) -> Self {
        Self::OnboardingDecision(s)
    }
}

impl From<LivenessInfo> for DbUserTimelineEvent {
    fn from(s: LivenessInfo) -> Self {
        Self::Liveness(s)
    }
}

impl From<AnnotationInfo> for DbUserTimelineEvent {
    fn from(s: AnnotationInfo) -> Self {
        Self::Annotation(s)
    }
}

impl From<WatchlistCheckInfo> for DbUserTimelineEvent {
    fn from(s: WatchlistCheckInfo) -> Self {
        Self::WatchlistCheck(s)
    }
}

impl From<VaultCreatedInfo> for DbUserTimelineEvent {
    fn from(s: VaultCreatedInfo) -> Self {
        Self::VaultCreated(s)
    }
}

impl From<WorkflowTriggeredInfo> for DbUserTimelineEvent {
    fn from(s: WorkflowTriggeredInfo) -> Self {
        Self::WorkflowTriggered(s)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataCollectedInfo {
    pub attributes: Vec<CollectedDataOption>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BiometricRegisteredInfo {
    pub id: WebauthnCredentialId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityDocumentUploadedInfo {
    pub id: IdentityDocumentId,
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
    pub workflow_id: WorkflowId,
    pub actor: DbActor,
}

use crate::{
    AnnotationId, CollectedDataOption, IdentityDocumentId, LivenessEventId, OnboardingDecisionId,
    WebauthnCredentialId,
};
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum::EnumDiscriminants;

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb, EnumDiscriminants)]
#[strum_discriminants(name(DbUserTimelineEventKind))]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum DbUserTimelineEvent {
    DataCollected(DataCollectedInfo),
    IdentityDocumentUploaded(IdentityDocumentUploadedInfo),
    OnboardingDecision(OnboardingDecisionInfo),
    Liveness(LivenessInfo),
    Annotation(AnnotationInfo),
}

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

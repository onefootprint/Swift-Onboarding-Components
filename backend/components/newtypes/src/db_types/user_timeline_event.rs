use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

use crate::{CollectedDataOption, IdentityDocumentId, OnboardingDecisionId, WebauthnCredentialId};

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum UserTimelineEvent {
    DataCollected(DataCollectedInfo),
    BiometricRegistered(BiometricRegisteredInfo),
    DocumentUploaded(DocumentUploadedInfo),
    OnboardingDecision(OnboardingDecisionInfo),
}

impl From<DataCollectedInfo> for UserTimelineEvent {
    fn from(s: DataCollectedInfo) -> Self {
        Self::DataCollected(s)
    }
}

impl From<BiometricRegisteredInfo> for UserTimelineEvent {
    fn from(s: BiometricRegisteredInfo) -> Self {
        Self::BiometricRegistered(s)
    }
}

impl From<DocumentUploadedInfo> for UserTimelineEvent {
    fn from(s: DocumentUploadedInfo) -> Self {
        Self::DocumentUploaded(s)
    }
}

impl From<OnboardingDecisionInfo> for UserTimelineEvent {
    fn from(s: OnboardingDecisionInfo) -> Self {
        Self::OnboardingDecision(s)
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
pub struct DocumentUploadedInfo {
    pub id: IdentityDocumentId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnboardingDecisionInfo {
    pub id: OnboardingDecisionId,
}

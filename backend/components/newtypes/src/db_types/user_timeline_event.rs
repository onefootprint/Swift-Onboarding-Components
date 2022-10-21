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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataCollectedInfo {
    pub attributes: Vec<CollectedDataOption>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BiometricRegisteredInfo {
    pub credential_id: WebauthnCredentialId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentUploadedInfo {
    pub document_id: IdentityDocumentId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnboardingDecisionInfo {
    pub decision_id: OnboardingDecisionId,
}

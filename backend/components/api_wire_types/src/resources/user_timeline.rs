use newtypes::CollectedDataOption;

use crate::{
    export_schema, Annotation, Apiv2Schema, DateTime, Deserialize, IdentityDocumentTimelineEvent, JsonSchema,
    LivenessEvent, OnboardingDecision, Serialize, Utc,
};

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct UserTimeline {
    pub event: UserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub is_from_other_org: bool,
}

export_schema!(UserTimeline);

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
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
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct DataCollectedInfo {
    pub attributes: Vec<CollectedDataOption>,
}

export_schema!(UserTimelineEvent);

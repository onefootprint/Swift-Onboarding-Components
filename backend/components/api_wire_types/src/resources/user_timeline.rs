use newtypes::CollectedDataOption;

use crate::{
    export_schema, Actor, Annotation, Apiv2Schema, DateTime, Deserialize, JsonSchema, LivenessEvent,
    OnboardingDecision, Serialize, Utc,
};

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct UserTimeline {
    pub event: UserTimelineEvent,
    pub timestamp: DateTime<Utc>,
}

export_schema!(UserTimeline);

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
#[allow(clippy::large_enum_variant)]
pub enum UserTimelineEvent {
    DataCollected(DataCollectedInfo),
    Liveness(LivenessEvent),
    DocumentUploaded(), // TODO
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

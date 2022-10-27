use newtypes::CollectedDataOption;

use crate::{
    export_schema, Apiv2Schema, DateTime, Deserialize, JsonSchema, LivenessEvent, OnboardingDecision,
    Serialize, Utc,
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
pub enum UserTimelineEvent {
    DataCollected(DataCollectedInfo),
    BiometricRegistered(LivenessEvent),
    DocumentUploaded(), // TODO
    OnboardingDecision(OnboardingDecision),
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct DataCollectedInfo {
    pub attributes: Vec<CollectedDataOption>,
}

export_schema!(UserTimelineEvent);

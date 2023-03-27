use std::collections::HashMap;

use crate::*;

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct TimelineEvent {
    pub event: TimelineEventKind,
    pub timestamp: DateTime<Utc>,
}

export_schema!(TimelineEvent);

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum TimelineEventKind {
    RequirementFulfilled(RequirementFulfilledEvent),
    Decision(DecisionEvent),
    Onboard(OnboardingEvent),
}
export_schema!(TimelineEventKind);

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct RequirementFulfilledEvent {
    pub requirement_id: RequirementId,
    pub vendors: Vec<Vendor>,
    /// contains meta data about the event
    pub attributes: HashMap<String, String>,
}
export_schema!(RequirementFulfilledEvent);

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct DecisionEvent {
    pub decision_id: OnboardingDecisionId,
}
export_schema!(DecisionEvent);

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct OnboardingEvent {
    pub onboarding_id: OnboardingId,
}
export_schema!(OnboardingEvent);

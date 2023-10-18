use crate::*;

/// Describes the outcome of an onboarding decision that took place on the user
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct OnboardingDecision {
    pub id: OnboardingDecisionId,
    pub status: DecisionStatus,
    pub timestamp: DateTime<Utc>,
    pub source: Actor,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ob_configuration: Option<LiteObConfiguration>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub manual_review: Option<ManualReview>,
}

/// ObConfiguration serialization used inside of an OnboardingDecision
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct LiteObConfiguration {
    pub must_collect_data: Vec<CollectedDataOption>,
}

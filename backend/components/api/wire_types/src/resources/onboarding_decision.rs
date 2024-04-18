use crate::*;
use newtypes::{
    CollectedDataOption, DecisionStatus, ObConfigurationId, OnboardingDecisionId, RuleSetResultId,
};

/// Describes the outcome of an onboarding decision that took place on the user
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct OnboardingDecision {
    pub id: OnboardingDecisionId,
    pub status: DecisionStatus,
    pub timestamp: DateTime<Utc>,
    pub source: Actor,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ob_configuration: Option<TimelinePlaybook>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub manual_review: Option<ManualReview>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rule_set_result_id: Option<RuleSetResultId>,
}

/// ObConfiguration serialization used inside of an OnboardingDecision
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct TimelinePlaybook {
    pub id: ObConfigurationId,
    pub name: String,
    pub must_collect_data: Vec<CollectedDataOption>,
}

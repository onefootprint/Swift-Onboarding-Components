use crate::*;
use newtypes::CollectedDataOption;
use newtypes::DecisionStatus;
use newtypes::ManualReviewKind;
use newtypes::ObConfigurationId;
use newtypes::OnboardingDecisionId;
use newtypes::RuleSetResultId;

/// Describes the outcome of an onboarding decision that took place on the user
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct OnboardingDecision {
    pub id: OnboardingDecisionId,
    pub status: DecisionStatus,
    pub timestamp: DateTime<Utc>,
    pub source: Actor,
    pub ob_configuration: TimelinePlaybook,
    pub rule_set_result_id: Option<RuleSetResultId>,
    pub cleared_manual_reviews: Vec<ManualReview>,
    /// When true, the rules were ran for this decision despite being in sandbox mode - we should
    /// show the rules outcome drawer
    pub ran_rules_in_sandbox: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct ManualReview {
    pub kind: ManualReviewKind,
}

/// ObConfiguration serialization used inside of an OnboardingDecision
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct TimelinePlaybook {
    pub id: ObConfigurationId,
    pub name: String,
    pub must_collect_data: Vec<CollectedDataOption>,
}

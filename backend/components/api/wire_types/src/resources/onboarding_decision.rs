use crate::*;
use macros::JsonResponder;
use newtypes::CollectedDataOption;
use newtypes::DecisionStatus;
use newtypes::ManualReviewKind;
use newtypes::ObConfigurationId;
use newtypes::OnboardingDecisionId;
use newtypes::PlaybookId;
use newtypes::PublishablePlaybookKey;
use newtypes::RuleSetResultId;
use newtypes::WorkflowKind;

/// Describes the outcome of an onboarding decision that took place on the user.
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct TimelineOnboardingDecision {
    pub id: OnboardingDecisionId,
    pub status: DecisionStatus,
    pub timestamp: DateTime<Utc>,
    pub source: Actor,
    pub workflow_kind: WorkflowKind,
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
    pub playbook_id: PlaybookId,
    pub name: String,
    pub must_collect_data: Vec<CollectedDataOption>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonResponder)]

pub struct PublicOnboardingDecision {
    pub status: DecisionStatus,
    pub timestamp: DateTime<Utc>,
    pub playbook_key: Option<PublishablePlaybookKey>,
    pub kind: OnboardingDecisionKind,
}

#[derive(
    Debug, Clone, strum_macros::Display, serde_with::SerializeDisplay, Apiv2Schema, macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum OnboardingDecisionKind {
    /// Decision made manually by a human
    Manual,
    /// Decision made automatically by a playbook run
    PlaybookRun,
}

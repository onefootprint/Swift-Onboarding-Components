use std::collections::HashMap;

use serde_with::SerializeDisplay;

use crate::*;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct Rule {
    pub rule_id: RuleId,
    pub created_at: DateTime<Utc>,
    // pub actor: Actor, // TODO: add later, gotta do the saturate nonsense
    pub name: Option<String>,
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub is_shadow: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct RuleSetResult {
    pub created_at: DateTime<Utc>,
    pub ob_configuration_id: ObConfigurationId,
    pub action_triggered: Option<RuleAction>,
    pub rule_results: Vec<RuleResult>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct RuleResult {
    pub rule: Rule,
    pub result: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct RuleEvalResults {
    pub results: Vec<RuleEvalResult>,
    pub stats: RuleEvalStats,
}
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct RuleEvalResult {
    pub fp_id: FpId,
    pub current_status: Option<OnboardingStatus>,
    pub historical_action_triggered: Option<RuleAction>,
    pub backtest_rule_result: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct RuleEvalStats {
    pub total: usize,
    pub counts: Counts,
    pub counts_by_current_status: HashMap<OnboardingStatus, Counts>,
    pub counts_by_historical_action_triggered: HashMap<RuleResultRuleAction, Counts>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct Counts {
    pub triggered: usize,
    pub not_triggered: usize,
}

// TODO: use for RuleSetResult.action_triggered too probably
#[derive(Debug, Display, SerializeDisplay, Apiv2Schema, Clone, PartialEq, Eq, Hash)]
#[strum(serialize_all = "snake_case")]
pub enum RuleResultRuleAction {
    Pass,
    PassWithManualReview,
    ManualReview,
    StepUp,
    Fail,
}

impl From<Option<RuleAction>> for RuleResultRuleAction {
    fn from(value: Option<RuleAction>) -> Self {
        match value {
            Some(v) => match v {
                RuleAction::PassWithManualReview => Self::PassWithManualReview,
                RuleAction::ManualReview => Self::ManualReview,
                RuleAction::StepUp => Self::StepUp,
                RuleAction::Fail => Self::Fail,
            },
            None => RuleResultRuleAction::Pass,
        }
    }
}

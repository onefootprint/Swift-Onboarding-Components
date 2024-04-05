use newtypes::{FpId, ObConfigurationId, OnboardingStatus, RuleAction, RuleExpression, RuleId};
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
    // As of 2023-01-31, FE is still on legacy serialization of `step_up`, so we convert from internal RA to RSRA
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
    pub backtest_action_triggered: Option<RuleAction>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema, PartialEq, Eq)]
pub struct RuleEvalStats {
    pub total: usize,
    pub count_by_historical_action_triggered: HashMap<RuleResultRuleAction, usize>,
    pub count_by_backtest_action_triggered: HashMap<RuleResultRuleAction, usize>,
    pub count_by_historical_and_backtest_action_triggered:
        HashMap<RuleResultRuleAction, HashMap<RuleResultRuleAction, usize>>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct Counts {
    pub triggered: usize,
    pub not_triggered: usize,
    pub triggered_rate: f32,
}

impl Counts {
    pub fn new(triggered: usize, not_triggered: usize) -> Self {
        let total = triggered + not_triggered;
        let triggered_rate = if total == 0 {
            0.0
        } else {
            triggered as f32 / (triggered + not_triggered) as f32
        };

        Counts {
            triggered,
            not_triggered,
            triggered_rate,
        }
    }
}

impl Eq for Counts {}
// just implemented because f32 doesn't have a built in Eq impl
impl PartialEq for Counts {
    fn eq(&self, other: &Self) -> bool {
        self.triggered == other.triggered
            && self.not_triggered == other.not_triggered
            && (self.triggered_rate - other.triggered_rate).abs() < f32::EPSILON
    }
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
                RuleAction::StepUp(_) => Self::StepUp,
                RuleAction::Fail => Self::Fail,
            },
            None => RuleResultRuleAction::Pass,
        }
    }
}


#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct RuleSet {
    pub version: i32,
}

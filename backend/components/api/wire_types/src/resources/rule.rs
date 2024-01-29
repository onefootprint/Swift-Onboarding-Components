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
    // TODO: stats
}
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct RuleEvalResult {
    pub fp_id: FpId,
    pub current_status: Option<OnboardingStatus>,
    pub historical_action_triggered: Option<RuleAction>,
    // TODO:
    // pub backtest_rule_result: bool,
}

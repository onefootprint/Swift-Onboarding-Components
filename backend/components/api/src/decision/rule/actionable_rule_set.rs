use crate::feature_flag::FeatureFlagClient;

use super::{
    rule_set::{EvaluateRuleSet, EvaluatedRuleSet, RuleSet, RuleSetResult},
    RuleName, RuleSetName,
};

const RULE_ENABLE_FLAG: &str = "EnableRuleSetForDecision";
/// An actionable rule set is a ruleset that we need to check if we can action on
/// This allows for us to slow rollout some rule sets behind feature flags, or have them only
/// apply in certain situations (e.g. in the future, can_action can be driven by TenantId or some other attribute)
pub struct ActionableRuleSet<T: Clone> {
    ruleset: RuleSet<T>,
    can_action: bool,
}

/// The result of evaluating an ActionableRuleSet
#[derive(Clone)]
pub struct ActionableRuleSetResult {
    pub ruleset_name: RuleSetName,
    pub ruleset_result: RuleSetResult,
    pub can_action: bool,
}

impl EvaluatedRuleSet for ActionableRuleSetResult {
    fn triggered(&self) -> bool {
        self.ruleset_result.triggered && self.can_action
    }
    fn ruleset_name(&self) -> &RuleSetName {
        &self.ruleset_result.ruleset_name
    }
    fn can_action(&self) -> bool {
        self.can_action
    }
    fn rules_triggered(&self) -> &Vec<RuleName> {
        &self.ruleset_result.rules_triggered
    }
    fn rules_not_triggered(&self) -> &Vec<RuleName> {
        &self.ruleset_result.rules_not_triggered
    }
}

impl<T: Clone> EvaluateRuleSet<T> for ActionableRuleSet<T> {
    type RuleResult = ActionableRuleSetResult;

    fn evaluate(&self, rule_input: &T) -> Self::RuleResult {
        let evaluated = self.ruleset.evaluate(rule_input);

        ActionableRuleSetResult {
            ruleset_name: self.ruleset.name.clone(),
            ruleset_result: evaluated,
            can_action: self.can_action,
        }
    }
}

/// Turn a ruleset into an actionable ruleset by checking a flag (or other attributes)
pub struct ActionableRuleSetBuilder<T: Clone> {
    ruleset: RuleSet<T>,
}
impl<T: Clone> ActionableRuleSetBuilder<T> {
    pub fn new(ruleset: RuleSet<T>) -> Self {
        Self { ruleset }
    }

    pub fn build(self, feature_flag_client: &impl FeatureFlagClient) -> ActionableRuleSet<T> {
        let can_action = feature_flag_client
            .bool_flag_by_rule_set_name(RULE_ENABLE_FLAG, &self.ruleset.name)
            .unwrap_or(false);

        ActionableRuleSet {
            ruleset: self.ruleset,
            can_action,
        }
    }
}

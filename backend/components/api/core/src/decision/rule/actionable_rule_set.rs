use std::sync::Arc;

use feature_flag::{BoolFlag, FeatureFlagClient};

use super::{
    rule_set::{EvaluateRuleSet, RuleSet, RuleSetResult},
    RuleSetName,
};

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

impl<T: Clone> EvaluateRuleSet<T> for ActionableRuleSet<T> {
    fn evaluate(&self, rule_input: &T) -> RuleSetResult {
        let base = self.ruleset.evaluate(rule_input);

        RuleSetResult {
            ruleset_name: base.ruleset_name,
            rules_triggered: base.rules_triggered,
            rules_not_triggered: base.rules_not_triggered,
            triggered: base.triggered,
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

    pub fn build(self, feature_flag_client: Arc<dyn FeatureFlagClient>) -> ActionableRuleSet<T> {
        let can_action = feature_flag_client.flag(BoolFlag::EnableRuleSetForDecision(&self.ruleset.name));

        ActionableRuleSet {
            ruleset: self.ruleset,
            can_action,
        }
    }
}

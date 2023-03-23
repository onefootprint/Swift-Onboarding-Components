use super::{RuleName, RuleSetName};

/// A rule is just a named wrapper around a fn that takes a T and returns a bool
#[derive(Clone)]
pub struct Rule<T> {
    pub name: RuleName,
    pub rule: fn(&T) -> bool,
}
/// A set of rules
pub struct RuleSet<T: Clone> {
    pub name: RuleSetName,
    pub rules: Vec<Rule<T>>,
}

/// Trait representing the evaluation of a RuleSet
pub trait EvaluateRuleSet<T> {
    fn evaluate(&self, rule_input: &T) -> RuleSetResult;
}

impl<T: Clone> EvaluateRuleSet<T> for RuleSet<T> {
    fn evaluate(&self, rule_input: &T) -> RuleSetResult {
        // for the rules in the rule set, evaluate each rule
        let evaluated = self
            .rules
            .iter()
            .cloned()
            .map(|rule| (rule.name, (rule.rule)(rule_input)));

        // partition rules by whethere or not the rule evaluated to true
        let (triggered, not_triggered): (Vec<_>, Vec<_>) =
            evaluated.partition(|(_, rule_is_true)| *rule_is_true);

        // Build a struct that represents the result of evaluating the rule set
        RuleSetResult {
            ruleset_name: self.name.clone(),
            rules_triggered: triggered
                .iter()
                .map(|(rule_name, _)| rule_name)
                .cloned()
                .collect(),
            rules_not_triggered: not_triggered
                .iter()
                .map(|(rule_name, _)| rule_name)
                .cloned()
                .collect(),
            triggered: !triggered.is_empty(),
            can_action: true,
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct RuleSetResult {
    pub ruleset_name: RuleSetName,
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
    pub triggered: bool,
    pub can_action: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::decision::rule::test_fixtures::*;
    use test_case::test_case;

    #[test_case(test_ruleset_a(), TestFeatures::new("hello") =>  RuleSetResult {
            ruleset_name: test_ruleset_name(),
            rules_triggered: vec![RuleName::Test("test.hello".into()), RuleName::Test("test.length_gt_3".into())],
            rules_not_triggered: vec![],
            triggered: true,
            can_action: true,
        })]
    #[test_case(test_ruleset_a(), TestFeatures::new("world") =>  RuleSetResult {
            ruleset_name: test_ruleset_name(),
            rules_triggered: vec![RuleName::Test("test.length_gt_3".into())],
            rules_not_triggered: vec![RuleName::Test("test.hello".into())],
            triggered: true,
            can_action: true,
        })]
    #[test_case(test_ruleset_b(), TestFeatures::new("goodbye") =>  RuleSetResult {
            ruleset_name: test_ruleset_other_name(),
            rules_triggered: vec![],
            rules_not_triggered: vec![RuleName::Test("test.world".into())],
            triggered: false,
            can_action: true,
        })]
    fn test_rule_set(rule_set: RuleSet<TestFeatures>, input_data: TestFeatures) -> RuleSetResult {
        rule_set.evaluate(&input_data)
    }
}

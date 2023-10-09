use super::{RuleName, RuleSetName};

/// An Action is an indication of a Rule's purpose when a rule evaluate to true
#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub enum Action {
    /// ORDERING MATTERS!!!
    PassWithManualReview,
    StepUp,
    ManualReview,
    Fail,
}

impl Action {
    pub fn should_create_review(&self) -> bool {
        matches!(self, Self::PassWithManualReview | Self::ManualReview)
    }
}

/// A rule is just a named wrapper around a fn that takes a T and returns a bool
#[derive(Clone)]
pub struct Rule<T> {
    pub name: RuleName,
    pub rule: fn(&T) -> bool,
    pub action: Action,
}

/// A set of rules
#[derive(Clone)]
pub struct RuleSet<T: Clone> {
    pub name: RuleSetName,
    pub rules: Vec<Rule<T>>,
}

impl<T: Clone> RuleSet<T> {
    pub fn evaluate(&self, rule_input: &T) -> RuleSetResult {
        // for the rules in the rule set, evaluate each rule
        let evaluated = self.rules.iter().cloned().map(|rule| RuleEvaluationSummary {
            name: rule.name,
            action: rule.action,
            triggered: (rule.rule)(rule_input),
        });

        // partition rules by whether or not the rule evaluated to true
        let (rules_triggered, rules_not_triggered): (Vec<_>, Vec<_>) = evaluated.partition(|r| r.triggered);

        // overall action for the rule set
        let action_for_rule_set = rules_triggered.iter().map(|r| r.action.clone()).max();

        // Build a struct that represents the result of evaluating the rule set
        RuleSetResult {
            ruleset_name: self.name.clone(),
            rules_triggered,
            rules_not_triggered,
            action: action_for_rule_set,
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct RuleSetResult {
    pub ruleset_name: RuleSetName,
    pub rules_triggered: Vec<RuleEvaluationSummary>,
    pub rules_not_triggered: Vec<RuleEvaluationSummary>,
    pub action: Option<Action>,
}

impl RuleSetResult {
    pub fn triggered_rule_names(&self) -> Vec<RuleName> {
        self.rules_triggered.iter().map(|r| r.name.clone()).collect()
    }

    pub fn not_triggered_rule_names(&self) -> Vec<RuleName> {
        self.rules_not_triggered.iter().map(|r| r.name.clone()).collect()
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct RuleEvaluationSummary {
    pub name: RuleName,
    pub action: Action,
    pub triggered: bool,
}

pub struct RulesResult {}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::decision::rule::test_fixtures::*;
    use std::cmp::Ordering;
    use test_case::test_case;

    #[test_case(test_ruleset_a(), TestFeatures::new("hello") =>  RuleSetResult {
            ruleset_name: test_ruleset_name(),
            rules_triggered: vec![RuleEvaluationSummary {name: RuleName::Test("test.hello".into()), action: Action::Fail, triggered: true}, RuleEvaluationSummary {name: RuleName::Test("test.length_gt_3".into()), action: Action::StepUp, triggered: true}],
            rules_not_triggered: vec![],
            action: Some(Action::Fail),
        })]
    #[test_case(test_ruleset_a(), TestFeatures::new("world") =>  RuleSetResult {
            ruleset_name: test_ruleset_name(),
            rules_triggered: vec![RuleEvaluationSummary {name: RuleName::Test("test.length_gt_3".into()), action: Action::StepUp, triggered: true}],
            rules_not_triggered: vec![RuleEvaluationSummary {name: RuleName::Test("test.hello".into()), action: Action::Fail, triggered: false}],
            action: Some(Action::StepUp),
        })]
    #[test_case(test_ruleset_b(), TestFeatures::new("goodbye") =>  RuleSetResult {
            ruleset_name: test_ruleset_other_name(),
            rules_triggered: vec![],
            rules_not_triggered: vec![RuleEvaluationSummary {name: RuleName::Test("test.world".into()), action: Action::Fail, triggered: false}],
            action: None
        })]
    fn test_rule_set(rule_set: RuleSet<TestFeatures>, input_data: TestFeatures) -> RuleSetResult {
        rule_set.evaluate(&input_data)
    }

    #[test_case(Action::StepUp, Action::PassWithManualReview  => Ordering::Greater)]
    #[test_case(Action::ManualReview, Action::PassWithManualReview  => Ordering::Greater)]
    #[test_case(Action::ManualReview, Action::StepUp => Ordering::Greater)]
    #[test_case(Action::Fail, Action::ManualReview => Ordering::Greater)]
    fn test_cmp_action_ordering(s1: Action, s2: Action) -> Ordering {
        // Test ordering since we rely on it to extract minimum status
        s1.cmp(&s2)
    }
}

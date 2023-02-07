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
    type RuleResult: EvaluatedRuleSet;
    fn evaluate(&self, rule_input: &T) -> Self::RuleResult;
}

/// Trait representing if a ruleset is triggered
pub trait EvaluatedRuleSet {
    fn triggered(&self) -> bool;
    fn ruleset_name(&self) -> &RuleSetName;
    fn can_action(&self) -> bool;
    fn rules_triggered(&self) -> &Vec<RuleName>;
    fn rules_not_triggered(&self) -> &Vec<RuleName>;
}

impl<T: Clone> EvaluateRuleSet<T> for RuleSet<T> {
    type RuleResult = RuleSetResult;

    fn evaluate(&self, rule_input: &T) -> Self::RuleResult {
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
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct RuleSetResult {
    pub ruleset_name: RuleSetName,
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
    pub triggered: bool,
}

impl EvaluatedRuleSet for RuleSetResult {
    fn triggered(&self) -> bool {
        self.triggered
    }
    fn ruleset_name(&self) -> &RuleSetName {
        &self.ruleset_name
    }
    fn can_action(&self) -> bool {
        true
    }
    fn rules_triggered(&self) -> &Vec<RuleName> {
        &self.rules_triggered
    }
    fn rules_not_triggered(&self) -> &Vec<RuleName> {
        &self.rules_not_triggered
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[derive(Clone)]
    struct Test {
        pub name: String,
    }
    impl Test {
        pub fn new(s: &str) -> Self {
            Test { name: s.into() }
        }
    }

    fn test_ruleset_name() -> RuleSetName {
        RuleSetName::Test("Test Rules".into())
    }

    fn test_ruleset_other_name() -> RuleSetName {
        RuleSetName::Test("Other Test rules".into())
    }

    fn test_ruleset_a() -> RuleSet<Test> {
        // 3 rules
        let hello_rule: Rule<Test> = Rule {
            name: RuleName::Test("test.hello".into()),
            rule: { |t| t.name == *"hello" },
        };

        let length_rule: Rule<Test> = Rule {
            name: RuleName::Test("test.length_gt_3".into()),
            rule: { |t| t.name.len() > 3 },
        };

        RuleSet {
            name: test_ruleset_name(),
            rules: vec![hello_rule, length_rule],
        }
    }
    fn test_ruleset_b() -> RuleSet<Test> {
        let world_rule: Rule<Test> = Rule {
            name: RuleName::Test("test.world".into()),
            rule: { |t| t.name == *"world" },
        };

        RuleSet {
            name: test_ruleset_other_name(),
            rules: vec![world_rule],
        }
    }

    #[test_case(test_ruleset_a(), Test::new("hello") =>  RuleSetResult {
            ruleset_name: test_ruleset_name(),
            rules_triggered: vec![RuleName::Test("test.hello".into()), RuleName::Test("test.length_gt_3".into())],
            rules_not_triggered: vec![],
            triggered: true
        })]
    #[test_case(test_ruleset_a(), Test::new("world") =>  RuleSetResult {
            ruleset_name: test_ruleset_name(),
            rules_triggered: vec![RuleName::Test("test.length_gt_3".into())],
            rules_not_triggered: vec![RuleName::Test("test.hello".into())],
            triggered: true
        })]
    #[test_case(test_ruleset_b(), Test::new("goodbye") =>  RuleSetResult {
            ruleset_name: test_ruleset_other_name(),
            rules_triggered: vec![],
            rules_not_triggered: vec![RuleName::Test("test.world".into())],
            triggered: false
        })]
    fn test_rule_set(rule_set: RuleSet<Test>, input_data: Test) -> RuleSetResult {
        rule_set.evaluate(&input_data)
    }
}

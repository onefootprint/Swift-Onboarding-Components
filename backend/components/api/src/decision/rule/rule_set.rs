use newtypes::RuleSetName;

#[derive(Debug, Clone, Eq, PartialEq)]
pub enum RuleOutcome {
    Pass,
    Fail,
}
/// A rule is just a wrapper around a fn that takes a T and returns a bool
#[derive(Clone)]
pub struct Rule<T> {
    pub rule: fn(&T) -> bool,
    pub name: String,
    pub outcome: RuleOutcome,
}

/// The result of evaluating a RuleSet
#[derive(Debug, Clone, Eq, PartialEq)]
pub struct RuleSetResult {
    pub ruleset_name: RuleSetName,
    // TODO: clean this up
    pub passing_rules_triggered: Vec<String>,
    pub failing_rules_triggered: Vec<String>,
    pub rules_not_triggered: Vec<String>,
}

/// A named set of Rules
pub struct RuleSet<T> {
    pub name: RuleSetName,
    pub rules: Vec<Rule<T>>,
}
impl<T> RuleSet<T> {
    pub fn evaluate(self, rule_input: &T) -> RuleSetResult {
        // Partition by rules triggered and not triggered
        let (rules_triggered, rules_not_triggered): (Vec<_>, Vec<_>) =
            self.rules.into_iter().partition(|rule| (rule.rule)(rule_input));
        let (passing_rules_triggered, failing_rules_triggered): (Vec<_>, Vec<_>) = rules_triggered
            .into_iter()
            .partition(|r| r.outcome == RuleOutcome::Pass);

        // Return results
        RuleSetResult {
            ruleset_name: self.name,
            // TODO: clean this up
            passing_rules_triggered: passing_rules_triggered.into_iter().map(|r| r.name).collect(),
            failing_rules_triggered: failing_rules_triggered.into_iter().map(|r| r.name).collect(),
            rules_not_triggered: rules_not_triggered.into_iter().map(|r| r.name).collect(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    struct Test {
        pub name: String,
    }
    impl Test {
        pub fn new(s: &str) -> Self {
            Test { name: s.into() }
        }
    }

    fn test_ruleset_name() -> RuleSetName {
        "Test rules".to_string().into()
    }

    fn test_ruleset() -> RuleSet<Test> {
        // 3 rules
        let hello_rule: Rule<Test> = Rule {
            name: "test.hello".into(),
            rule: { |t| t.name == *"hello" },
            outcome: RuleOutcome::Fail,
        };

        let world_rule: Rule<Test> = Rule {
            name: "test.world".into(),
            rule: { |t| t.name == *"world" },
            outcome: RuleOutcome::Pass,
        };

        let length_rule: Rule<Test> = Rule {
            name: "test.length_gt_3".into(),
            rule: { |t| t.name.len() > 3 },
            outcome: RuleOutcome::Fail,
        };

        RuleSet {
            name: test_ruleset_name(),
            rules: vec![hello_rule, world_rule, length_rule],
        }
    }

    #[test_case(test_ruleset(), Test::new("hello") =>  RuleSetResult {
            ruleset_name: test_ruleset_name(),
            failing_rules_triggered: vec!["test.hello".into(), "test.length_gt_3".into()],
            passing_rules_triggered: vec![],
            rules_not_triggered: vec!["test.world".into()],
        })]
    #[test_case(test_ruleset(), Test::new("world") =>  RuleSetResult {
            ruleset_name: test_ruleset_name(),
            failing_rules_triggered: vec!["test.length_gt_3".into()],
            passing_rules_triggered: vec!["test.world".into()],
            rules_not_triggered: vec!["test.hello".into()]
        })]
    #[test_case(test_ruleset(), Test::new("goodbye") =>  RuleSetResult {
            ruleset_name: test_ruleset_name(),
            failing_rules_triggered: vec!["test.length_gt_3".into()],
            passing_rules_triggered: vec![],
            rules_not_triggered: vec!["test.hello".into(), "test.world".into()]
        })]
    fn test_rule_set(rule_set: RuleSet<Test>, input_data: Test) -> RuleSetResult {
        rule_set.evaluate(&input_data)
    }
}

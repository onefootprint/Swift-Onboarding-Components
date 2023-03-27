use super::{
    rule_set::{Rule, RuleSet},
    RuleName, RuleSetName,
};

#[derive(Clone)]
pub struct TestFeatures {
    pub name: String,
}
impl TestFeatures {
    pub fn new(s: &str) -> Self {
        TestFeatures { name: s.into() }
    }
}

pub fn test_ruleset_name() -> RuleSetName {
    RuleSetName::Test("Test Rules".into())
}

pub fn test_ruleset_other_name() -> RuleSetName {
    RuleSetName::Test("Other Test rules".into())
}

pub fn test_ruleset_a() -> RuleSet<TestFeatures> {
    // 2 rules
    let hello_rule: Rule<TestFeatures> = Rule {
        name: RuleName::Test("test.hello".into()),
        rule: { |t| t.name == *"hello" },
    };

    let length_rule: Rule<TestFeatures> = Rule {
        name: RuleName::Test("test.length_gt_3".into()),
        rule: { |t| t.name.len() > 3 },
    };

    RuleSet {
        name: test_ruleset_name(),
        rules: vec![hello_rule, length_rule],
    }
}
pub fn test_ruleset_b() -> RuleSet<TestFeatures> {
    let world_rule: Rule<TestFeatures> = Rule {
        name: RuleName::Test("test.world".into()),
        rule: { |t| t.name == *"world" },
    };

    RuleSet {
        name: test_ruleset_other_name(),
        rules: vec![world_rule],
    }
}

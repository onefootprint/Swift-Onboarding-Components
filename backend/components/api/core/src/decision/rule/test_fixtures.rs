use newtypes::{FootprintReasonCode, RuleAction, RuleName, VerificationResultId};

use crate::decision::onboarding::FeatureSet;

use super::{
    rule_set::{Rule, RuleSet},
    RuleSetName,
};

#[derive(Clone)]
pub struct TestFeatures {
    pub name: String,
    pub frcs: Vec<FootprintReasonCode>,
    pub vres: VerificationResultId,
}

impl FeatureSet for TestFeatures {
    fn footprint_reason_codes(&self) -> Vec<newtypes::FootprintReasonCode> {
        self.frcs.clone()
    }

    fn vendor_apis(&self) -> Vec<newtypes::VendorAPI> {
        vec![newtypes::VendorAPI::TwilioLookupV2]
    }
}
impl TestFeatures {
    pub fn new(s: &str) -> Self {
        TestFeatures {
            name: s.into(),
            frcs: vec![],
            vres: VerificationResultId::from("vr".to_string()),
        }
    }
}

pub fn test_ruleset_name() -> RuleSetName {
    RuleSetName::Test("Test Rules".into())
}

pub fn test_ruleset_other_name() -> RuleSetName {
    RuleSetName::Test("Other Test rules".into())
}

pub fn test_ruleset_a() -> RuleSet<TestFeatures> {
    // 2 rules, 1 is step up
    let hello_rule: Rule<TestFeatures> = Rule {
        name: RuleName::Test("test.hello".into()),
        rule: { |t| t.name == *"hello" },
        action: RuleAction::Fail,
    };

    let length_rule: Rule<TestFeatures> = Rule {
        name: RuleName::Test("test.length_gt_3".into()),
        rule: { |t| t.name.len() > 3 },
        action: RuleAction::StepUp,
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
        action: RuleAction::Fail,
    };

    RuleSet {
        name: test_ruleset_other_name(),
        rules: vec![world_rule],
    }
}

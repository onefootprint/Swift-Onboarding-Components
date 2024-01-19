use newtypes::{FootprintReasonCode, RuleAction, RuleName, VendorAPI};

use super::{
    rule_set::{Rule, RuleEvaluationSummary, RuleSet, RuleSetResult},
    *,
};
use crate::decision::{onboarding::FeatureSet, rule::RULE_LOG_LINE};
use itertools::Itertools;
use strum::IntoEnumIterator;

pub fn evaluate_reason_code_rules(
    rules: Vec<Rule<Vec<FootprintReasonCode>>>,
    footprint_reason_codes: &Vec<FootprintReasonCode>,
    vendor_apis: Vec<VendorAPI>,
    allow_stepup: bool,
) -> OnboardingEvaluationResult {
    // for the rules in the rule set, evaluate each rule
    let evaluated = rules.iter().cloned().map(|rule| RuleEvaluationSummary {
        name: rule.name,
        action: rule.action,
        triggered: (rule.rule)(footprint_reason_codes),
    });

    // partition rules by whether or not the rule evaluated to true
    let (rules_triggered, rules_not_triggered): (Vec<_>, Vec<_>) = evaluated.partition(|r| r.triggered);

    // overall action for the rule set
    let allowed_rule_actions = RuleAction::iter()
        .filter(|r| allow_stepup || !matches!(r, RuleAction::StepUp))
        .collect_vec();
    let action_for_rule_set = rules_triggered
        .iter()
        .filter(|r| allowed_rule_actions.contains(&r.action))
        .map(|r| r.action)
        .max();

    // Build a struct that represents the result of evaluating the rule set
    let evaluated_ruleset = RuleSetResult {
        ruleset_name: RuleSetName::AllFootprintReasonCodeRules,
        rules_triggered,
        rules_not_triggered,
        action: action_for_rule_set,
    };
    let triggered_action = evaluated_ruleset.action;

    // Log evaluation of a single rule set
    log_ruleset_evaluation(&evaluated_ruleset, vendor_apis.clone());

    OnboardingEvaluationResult {
        rules_triggered: evaluated_ruleset.triggered_rule_names(),
        rules_not_triggered: evaluated_ruleset.not_triggered_rule_names(),
        triggered_action,
        vendor_apis,
    }
}

/// Evaluate a list of rulesets for a given input type T
pub fn evaluate_onboarding_rules<T>(
    rulesets: Vec<RuleSet<T>>,
    rule_input: &T,
    allow_stepup: bool,
) -> OnboardingEvaluationResult
where
    T: FeatureSet + Clone,
{
    let evaluated_rulesets: Vec<RuleSetResult> = rulesets
        .into_iter()
        .map(|rs| {
            // Evaluate ruleset
            let evaluated_ruleset = rs.evaluate(rule_input, allow_stepup);

            // Log evaluation of a single rule set
            log_ruleset_evaluation(&evaluated_ruleset, rule_input.vendor_apis());

            evaluated_ruleset
        })
        .collect();

    // Take the max action across all rulesets we evalauted
    let triggered_action = evaluated_rulesets.iter().filter_map(|r| r.action).max();

    let rules_triggered = evaluated_rulesets
        .iter()
        .flat_map(|r| r.triggered_rule_names())
        .collect();

    // Some rulesets that triggered, have constituent rules that did not evaluate to true
    let rules_not_triggered = evaluated_rulesets
        .iter()
        .flat_map(|r| r.not_triggered_rule_names())
        .collect();

    OnboardingEvaluationResult {
        rules_triggered,
        rules_not_triggered,
        triggered_action,
        vendor_apis: rule_input.vendor_apis(),
    }
}

fn log_ruleset_evaluation(rule_set_result: &RuleSetResult, vendor_apis: Vec<VendorAPI>) {
    tracing::info!(
        action=?rule_set_result.action,
        vendor_api=format!("{:?}", vendor_apis),
        rules_triggered_fail=%super::rules_to_string(&rule_set_result.rules_triggered.iter().filter_map(|r| (r.action == RuleAction::Fail).then_some(r.name.clone())).collect::<Vec<RuleName>>()),
        rules_triggered_steup=%super::rules_to_string(&rule_set_result.rules_triggered.iter().filter_map(|r| (r.action == RuleAction::StepUp).then_some(r.name.clone())).collect::<Vec<RuleName>>()),
        rules_not_triggered=%super::rules_to_string(&rule_set_result.rules_not_triggered.iter().map(|r| r.name.clone()).collect::<Vec<RuleName>>()),
        RULE_LOG_LINE
    )
}

/// Struct to represent the result of evaluating a set of RuleSets
#[derive(PartialEq, Eq, Debug, Clone)]
pub struct OnboardingEvaluationResult {
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
    pub triggered_action: Option<RuleAction>,
    pub vendor_apis: Vec<VendorAPI>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::decision::rule::test_fixtures::*;

    #[test]
    fn test_evaluate_onboarding_rules() {
        let features = TestFeatures::new("hello");
        let expected = OnboardingEvaluationResult {
            rules_triggered: vec![
                RuleName::Test("test.hello".into()),
                RuleName::Test("test.length_gt_3".into()),
            ],
            rules_not_triggered: vec![RuleName::Test("test.world".into())],
            triggered_action: Some(RuleAction::Fail),
            vendor_apis: features.vendor_apis(),
        };
        let result = evaluate_onboarding_rules(vec![test_ruleset_a(), test_ruleset_b()], &features, true);

        assert_eq!(expected, result)
    }
}

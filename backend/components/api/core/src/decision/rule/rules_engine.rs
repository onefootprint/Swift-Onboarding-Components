use crate::decision::{onboarding::FeatureSet, rule::RULE_LOG_LINE};

use super::{
    rule_set::{Action, RuleSet, RuleSetResult},
    *,
};

/// Evaluate a list of rulesets for a given input type T
pub fn evaluate_onboarding_rules<T>(rulesets: Vec<RuleSet<T>>, rule_input: &T) -> OnboardingEvaluationResult
where
    T: FeatureSet + Clone,
{
    let evaluated_rulesets: Vec<RuleSetResult> = rulesets
        .into_iter()
        .map(|rs| {
            // Evaluate ruleset
            let evaluated_ruleset = rs.evaluate(rule_input);

            // Log evaluation of a single rule set
            tracing::info!(
                rule_set_name=%evaluated_ruleset.ruleset_name,
                action=?evaluated_ruleset.action,
                rules_triggered_fail=%super::rules_to_string(&evaluated_ruleset.rules_triggered.iter().filter_map(|r| (r.action == Action::Fail).then_some(r.name.clone())).collect::<Vec<RuleName>>()),
                rules_triggered_steup=%super::rules_to_string(&evaluated_ruleset.rules_triggered.iter().filter_map(|r| (r.action == Action::StepUp).then_some(r.name.clone())).collect::<Vec<RuleName>>()),
                rules_not_triggered=%super::rules_to_string(&evaluated_ruleset.rules_not_triggered.iter().map(|r| r.name.clone()).collect::<Vec<RuleName>>()),
                RULE_LOG_LINE
            );

            evaluated_ruleset
        })
        .collect();

    // Take the max action across all rulesets we evalauted
    let triggered_action = evaluated_rulesets.iter().filter_map(|r| r.action.clone()).max();

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
    }
}

/// Struct to represent the result of evaluating a set of RuleSets
#[derive(PartialEq, Eq, Debug, Clone)]
pub struct OnboardingEvaluationResult {
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
    pub triggered_action: Option<Action>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::decision::rule::test_fixtures::*;

    #[test]
    fn test_evaluate_onboarding_rules() {
        let expected = OnboardingEvaluationResult {
            rules_triggered: vec![
                RuleName::Test("test.hello".into()),
                RuleName::Test("test.length_gt_3".into()),
            ],
            rules_not_triggered: vec![RuleName::Test("test.world".into())],
            triggered_action: Some(Action::Fail),
        };
        let result = evaluate_onboarding_rules(
            vec![test_ruleset_a(), test_ruleset_b()],
            &TestFeatures::new("hello"),
        );

        assert_eq!(expected, result)
    }
}

use crate::decision::rule::RULE_LOG_LINE;

use super::{rule_set::EvaluateRuleSet, *};

/// Evaluate a list of rulesets for a given input type T
pub fn evaluate_onboarding_rules<T>(
    rulesets: Vec<Box<dyn EvaluateRuleSet<T>>>,
    rule_input: &T,
) -> OnboardingEvaluationResult {
    let (actionable_rulesets_with_triggered_rules, actionable_rulesets_with_no_triggered_rules): (
        Vec<_>,
        Vec<_>,
    ) = rulesets
        .into_iter()
        .filter_map(|rs| {
            // Evaluate ruleset
            let evaluated_ruleset = rs.evaluate(rule_input);

            // Log evaluation of a single rule set
            tracing::info!(
                rule_set_name=%evaluated_ruleset.ruleset_name,
                can_action=%evaluated_ruleset.can_action,
                triggered=%evaluated_ruleset.triggered,
                rules_triggered=%super::rules_to_string(&evaluated_ruleset.rules_triggered),
                rules_not_triggered=%super::rules_to_string(&evaluated_ruleset.rules_not_triggered),
                RULE_LOG_LINE
            );

            // For purposes of onboarding rules, we only return rulesets that are actionable.
            // For shadow/slow rollouts, we log only
            if evaluated_ruleset.can_action {
                Some(evaluated_ruleset)
            } else {
                None
            }
        })
        .partition(|evaluated_ruleset| evaluated_ruleset.triggered);

    // We want to bundle up all the rulesets we evaluated into a form that is usable in the decision engine.
    //
    // Return if all rules that fired across all the rulesets we evaluated
    let all_rules_triggered = actionable_rulesets_with_triggered_rules
        .iter()
        .flat_map(|r| &r.rules_triggered)
        .cloned()
        .collect();

    // Some rulesets that triggered, have constituent rules that did not evaluate to true
    let triggered_rulesets_not_triggered_rules = actionable_rulesets_with_triggered_rules
        .iter()
        .flat_map(|r| &r.rules_not_triggered);

    // `actionable_rulesets_with_no_triggered_rules` are rulesets that had no firing rules, there are only non-triggering rules in this vec
    let all_rules_not_triggered = actionable_rulesets_with_no_triggered_rules
        .iter()
        .flat_map(|r| &r.rules_not_triggered)
        .chain(triggered_rulesets_not_triggered_rules)
        .cloned()
        .collect();

    OnboardingEvaluationResult {
        rules_triggered: all_rules_triggered,
        rules_not_triggered: all_rules_not_triggered,
        triggered: !actionable_rulesets_with_triggered_rules.is_empty(),
    }
}

/// Struct to represent the result of evaluating a set of RuleSets
#[derive(PartialEq, Eq, Debug, Clone)]
pub struct OnboardingEvaluationResult {
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
    pub triggered: bool,
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
            triggered: true,
        };
        let result = evaluate_onboarding_rules(
            vec![Box::new(test_ruleset_a()), Box::new(test_ruleset_b())],
            &TestFeatures::new("hello"),
        );

        assert_eq!(expected, result)
    }
}

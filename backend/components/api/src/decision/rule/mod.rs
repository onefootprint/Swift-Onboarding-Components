use newtypes::OnboardingId;
use std::string::ToString;
use strum::Display;

use self::rule_set::{EvaluateRuleSet, EvaluatedRuleSet};

pub mod actionable_rule_set;
pub mod onboarding_rules;
pub mod rule_set;

pub const RULE_LOG_LINE: &str = "Rule result";
/// Evaluate a list of rulesets for a given input type T
pub fn evaluate_onboarding_rules<T, R: EvaluateRuleSet<T>>(
    rulesets: Vec<R>,
    rule_input: &T,
    onboarding_id: &OnboardingId,
) -> bool {
    let (triggered, _not_triggered): (Vec<R::RuleResult>, Vec<R::RuleResult>) = rulesets
        .into_iter()
        .map(|rs| {
            // Evaluate rules
            let evaluated_ruleset = rs.evaluate(rule_input);

            // Log evaluation
            tracing::info!(
                rule_set_name=%evaluated_ruleset.ruleset_name(),
                can_action=%evaluated_ruleset.can_action(),
                triggered=%evaluated_ruleset.triggered(),
                onboarding_id=%onboarding_id,
                rules_triggered=%evaluated_ruleset.rules_triggered().iter().map(|r| r.to_string()).collect::<Vec<_>>().join(","),
                rules_not_triggered=%evaluated_ruleset.rules_not_triggered().iter().map(|r| r.to_string()).collect::<Vec<_>>().join(","),
                msg="rules evaluated",
                RULE_LOG_LINE
            );

            evaluated_ruleset
        })
        .partition(|evaluated_ruleset| evaluated_ruleset.triggered());

    // Return if any rules fired
    !triggered.is_empty()
}

#[derive(Debug, Clone, PartialEq, Eq, Display)]
#[strum(serialize_all = "snake_case")]
pub enum RuleSetName {
    IdologyBaseRules,
    IdologyConservativeFailingRules,
    #[cfg(test)]
    Test(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Display)]
#[strum(serialize_all = "snake_case")]
pub enum RuleName {
    IdNotLocated,
    SubjectDeceased,
    AddressInputIsPoBox,
    CoppaAlert,
    SsnDoesNotMatch,
    SsnInputIsInvalid,
    SsnLocatedIsInvalid,
    SsnIssuedPriorToDob,
    WatchlistPotentialHit,
    ThinFile,
    AddressDoesNotMatch,
    AddressLocatedIsWarm,
    AddressLocatedIsHighRiskAddress,
    #[cfg(test)]
    Test(String),
}

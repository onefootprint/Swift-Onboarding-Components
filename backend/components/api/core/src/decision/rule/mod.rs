use newtypes::RuleName;
use std::string::ToString;

pub mod rule_set;
pub mod rule_sets;
pub mod rules_engine;
#[cfg(test)]
pub mod test_fixtures;

pub const RULE_LOG_LINE: &str = "rule result";
pub const CANONICAL_ONBOARDING_RULE_LINE: &str = "canonical onboarding rules result";

pub fn rules_to_string(rules: &[RuleName]) -> String {
    rules.iter().map(|r| r.to_string()).collect::<Vec<_>>().join(",")
}

pub use newtypes::decision::RuleSetName;

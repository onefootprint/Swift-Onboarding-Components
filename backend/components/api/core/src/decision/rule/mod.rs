use std::string::ToString;
use strum::Display;

pub mod actionable_rule_set;
pub mod kyb_rules;
pub mod onboarding_rules;
pub mod rule_set;
pub mod rules_engine;
#[cfg(test)]
pub mod test_fixtures;

pub const RULE_LOG_LINE: &str = "rule result";
pub const CANONICAL_ONBOARDING_RULE_LINE: &str = "canonical onboarding rules result";

pub fn rules_to_string(rules: &[RuleName]) -> String {
    rules.iter().map(|r| r.to_string()).collect::<Vec<_>>().join(",")
}

pub use newtypes::decision::RuleSetName;

#[derive(Debug, Clone, PartialEq, Eq, Display, Hash)]
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
    WatchlistHit,
    ThinFile,
    AddressDoesNotMatch,
    AddressLocatedIsWarm,
    AddressLocatedIsHighRiskAddress,
    MultipleRecordsFound,
    #[cfg(test)]
    Test(String),
    BusinessWatchlistHit,
    NoTinMatch,
    NoBusinessNameMatch,
    NoBusinessAddressMatch,
    BoNonPassingKyc,
}

use strum::Display;

#[derive(Debug, Clone, PartialEq, Eq, Display)]
#[strum(serialize_all = "snake_case")]
pub enum RuleSetName {
    IdologyBaseRules,
    IdologyConservativeFailingRules,
    ExperianRules,
    Test(String),
}

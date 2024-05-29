use paperclip::actix::Apiv2Schema;
use strum::Display;

#[derive(Debug, Clone, PartialEq, Eq, Display)]
#[strum(serialize_all = "snake_case")]
pub enum RuleSetName {
    IdologyRules,
    IdologyConservativeFailingRules,
    AlpacaIdologyRules,
    AlpacaExperianRules,
    AlpacaIncodeRules,
    ExperianRules,
    IncodeRules,
    Test(String),
    MiddeskBaseRules,
    BosMustPassKycRules,
    AllFootprintReasonCodeRules,
}

#[derive(
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Hash,
    serde_with::SerializeDisplay,
    Display,
    Apiv2Schema,
    Ord,
    PartialOrd,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum MatchLevel {
    //
    // !!!! ORDERING MATTERS !!!!
    //
    // The inputted data and the located data do not match
    NoMatch,
    // The field in question is not verified (applies to phone/email)
    NotVerified,
    // We could not match, either because the input data wasn't provided and/or the data was not located
    CouldNotMatch,
    // Partial match (includes fuzzy)
    Partial,
    // The field in question is verified (applies to phone/email)
    Verified,
    // Exact match
    Exact,
}

#[cfg(test)]
mod tests {
    use super::MatchLevel;
    use super::MatchLevel::*;
    use std::cmp::Ordering;
    use test_case::test_case;

    #[test_case(NoMatch, CouldNotMatch => Ordering::Less)]
    #[test_case(NoMatch, Partial => Ordering::Less)]
    #[test_case(Partial, Exact => Ordering::Less)]
    #[test_case(NoMatch, Exact => Ordering::Less)]
    #[test_case(NotVerified, Verified => Ordering::Less)]
    fn test_cmp(a: MatchLevel, b: MatchLevel) -> Ordering {
        // We use the enum variant ordering to determine the highest priority level for an attribute,
        // so add some tests that this doesn't change
        a.cmp(&b)
    }
}

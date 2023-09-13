use crate::decision::{
    features::{experian::ExperianFeatures, idology_expectid::IDologyFeatures},
    rule::{
        rule_set::{Action, Rule, RuleSet},
        RuleName,
    },
};

use newtypes::{FootprintReasonCode, RuleSetName};

pub fn idology_base_rules() -> Vec<Rule<IDologyFeatures>> {
    vec![
        // If we don't have a located identity, we should fail
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::IdNotLocated)
                }
            },
            name: RuleName::IdNotLocated,
            action: Action::Fail,
        },
        //
        // These rules fire when the id is located, but there's red flags
        //
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SubjectDeceased)
                }
            },
            name: RuleName::SubjectDeceased,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::AddressInputIsPoBox)
                }
            },
            name: RuleName::AddressInputIsPoBox,
            action: Action::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::DobLocatedCoppaAlert)
                }
            },
            name: RuleName::CoppaAlert,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnDoesNotMatch)
                }
            },
            name: RuleName::SsnDoesNotMatch,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnInputIsInvalid)
                }
            },
            name: RuleName::SsnInputIsInvalid,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnLocatedIsInvalid)
                }
            },
            name: RuleName::SsnLocatedIsInvalid,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnNotProvided)
                }
            },
            name: RuleName::SsnNotProvided,
            action: Action::ManualReview,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::MultipleRecordsFound)
                }
            },
            name: RuleName::MultipleRecordsFound,
            action: Action::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnIssuedPriorToDob)
                }
            },
            name: RuleName::SsnIssuedPriorToDob,
            action: Action::Fail,
        },
    ]
}

pub fn idology_rule_set() -> RuleSet<IDologyFeatures> {
    let mut rules = idology_base_rules();
    rules.push(super::common::watchlist_hit_rule());

    RuleSet {
        rules,
        name: RuleSetName::IdologyRules,
    }
}

pub fn experian_base_rules() -> Vec<Rule<ExperianFeatures>> {
    vec![
        Rule {
            rule: |f: &ExperianFeatures| {
                f.footprint_reason_codes
                    .contains(&FootprintReasonCode::IdNotLocated)
            },
            name: RuleName::IdNotLocated,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &ExperianFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnDoesNotMatch)
                }
            },
            name: RuleName::SsnDoesNotMatch,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &ExperianFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnNotProvided)
                }
            },
            name: RuleName::SsnNotProvided,
            action: Action::ManualReview,
        },
    ]
}

pub fn experian_rule_set() -> RuleSet<ExperianFeatures> {
    let mut rules = experian_base_rules();
    rules.push(super::common::watchlist_hit_rule());

    RuleSet {
        rules,
        name: RuleSetName::ExperianRules,
    }
}

// NEW RULES
pub fn kyc_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    vec![
        Rule {
            rule: |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::IdNotLocated),
            name: RuleName::IdNotLocated,
            action: Action::Fail,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::SsnDoesNotMatch) },
            name: RuleName::SsnDoesNotMatch,
            action: Action::Fail,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::SsnNotProvided) },
            name: RuleName::SsnNotProvided,
            action: Action::ManualReview,
        },
        //
        // IDOLOGY RULES
        //
        // If we don't have a located identity, we should fail
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::IdNotLocated) },
            name: RuleName::IdNotLocated,
            action: Action::Fail,
        },
        //
        // These rules fire when the id is located, but there's red flags
        //
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::SubjectDeceased) },
            name: RuleName::SubjectDeceased,
            action: Action::Fail,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::AddressInputIsPoBox) },
            name: RuleName::AddressInputIsPoBox,
            action: Action::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::DobLocatedCoppaAlert) },
            name: RuleName::CoppaAlert,
            action: Action::Fail,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::SsnDoesNotMatch) },
            name: RuleName::SsnDoesNotMatch,
            action: Action::Fail,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::SsnInputIsInvalid) },
            name: RuleName::SsnInputIsInvalid,
            action: Action::Fail,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::SsnLocatedIsInvalid) },
            name: RuleName::SsnLocatedIsInvalid,
            action: Action::Fail,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::SsnNotProvided) },
            name: RuleName::SsnNotProvided,
            action: Action::ManualReview,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::MultipleRecordsFound) },
            name: RuleName::MultipleRecordsFound,
            action: Action::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::SsnIssuedPriorToDob) },
            name: RuleName::SsnIssuedPriorToDob,
            action: Action::Fail,
        },
    ]
}
#[cfg(test)]
mod tests {
    use std::collections::HashSet;

    use super::{experian_base_rules, idology_base_rules, idology_rule_set};
    use crate::decision::rule::RuleName;
    use itertools::Itertools;

    #[test]
    fn test_base_rules_do_not_have_watchlist() {
        assert!(
            !(idology_base_rules()
                .iter()
                .map(|r| &r.name)
                .contains(&RuleName::WatchlistHit))
        );

        assert!(
            !(experian_base_rules()
                .iter()
                .map(|r| &r.name)
                .contains(&RuleName::WatchlistHit))
        );
    }

    #[test]
    fn test_onboarding_rules_has_minimum() {
        let expected_rules: HashSet<RuleName> = HashSet::from_iter(
            vec![
                // important failures from idology they told us to always fail on
                RuleName::IdNotLocated,
                RuleName::SubjectDeceased,
                RuleName::MultipleRecordsFound,
                RuleName::SsnIssuedPriorToDob,
                RuleName::CoppaAlert,
                // potential watchlist hits
                RuleName::WatchlistHit,
            ]
            .into_iter(),
        );

        let rules = HashSet::from_iter(idology_rule_set().rules.into_iter().map(|r| r.name));

        assert!(expected_rules.is_subset(&rules))
    }
}

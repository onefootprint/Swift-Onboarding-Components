use crate::decision::{
    features::{experian::ExperianFeatures, idology_expectid::IDologyFeatures},
    rule::rule_set::{Rule, RuleSet},
};
use newtypes::{RuleAction, RuleName};

use newtypes::{FootprintReasonCode as FRC, RuleSetName};
const SSN_DOES_NOT_EXACTLY_MATCH_CODES: [FRC; 2] = [FRC::SsnDoesNotMatch, FRC::SsnPartiallyMatches];

pub fn idology_base_rules() -> Vec<Rule<IDologyFeatures>> {
    vec![
        // If we don't have a located identity, we should fail
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::IdNotLocated) },
            name: RuleName::IdNotLocated,
            action: RuleAction::Fail,
        },
        Rule {
            rule: |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::IdFlagged),
            name: RuleName::IdFlagged,
            action: RuleAction::Fail,
        },
        //
        // These rules fire when the id is located, but there's red flags
        //
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::SubjectDeceased) },
            name: RuleName::SubjectDeceased,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::AddressInputIsPoBox) },
            name: RuleName::AddressInputIsPoBox,
            action: RuleAction::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::DobLocatedCoppaAlert) },
            name: RuleName::CoppaAlert,
            action: RuleAction::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .iter()
                        .any(|frc| SSN_DOES_NOT_EXACTLY_MATCH_CODES.contains(frc))
                }
            },
            name: RuleName::SsnDoesNotMatch,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::SsnInputIsInvalid) },
            name: RuleName::SsnInputIsInvalid,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::SsnLocatedIsInvalid) },
            name: RuleName::SsnLocatedIsInvalid,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::SsnNotProvided) },
            name: RuleName::SsnNotProvided,
            action: RuleAction::ManualReview,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::MultipleRecordsFound) },
            name: RuleName::MultipleRecordsFound,
            action: RuleAction::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FRC::SsnIssuedPriorToDob) },
            name: RuleName::SsnIssuedPriorToDob,
            action: RuleAction::Fail,
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
            rule: |f: &ExperianFeatures| f.footprint_reason_codes.contains(&FRC::IdNotLocated),
            name: RuleName::IdNotLocated,
            action: RuleAction::Fail,
        },
        Rule {
            rule: |f: &ExperianFeatures| f.footprint_reason_codes.contains(&FRC::IdFlagged),
            name: RuleName::IdFlagged,
            action: RuleAction::Fail,
        },
        Rule {
            rule: {
                |f: &ExperianFeatures| {
                    f.footprint_reason_codes
                        .iter()
                        .any(|frc| SSN_DOES_NOT_EXACTLY_MATCH_CODES.contains(frc))
                }
            },
            name: RuleName::SsnDoesNotMatch,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &ExperianFeatures| f.footprint_reason_codes.contains(&FRC::SsnNotProvided) },
            name: RuleName::SsnNotProvided,
            action: RuleAction::ManualReview,
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
pub fn kyc_rules() -> Vec<Rule<Vec<FRC>>> {
    let kyc = vec![
        Rule {
            rule: |f: &Vec<FRC>| f.contains(&FRC::IdNotLocated),
            name: RuleName::IdNotLocated,
            action: RuleAction::Fail,
        },
        Rule {
            rule: |f: &Vec<FRC>| f.contains(&FRC::IdFlagged),
            name: RuleName::IdFlagged,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.iter().any(|frc| SSN_DOES_NOT_EXACTLY_MATCH_CODES.contains(frc)) },
            name: RuleName::SsnDoesNotMatch,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SsnNotProvided) },
            name: RuleName::SsnNotProvided,
            action: RuleAction::ManualReview,
        },
        //
        // IDOLOGY RULES
        //
        // If we don't have a located identity, we should fail
        //
        // These rules fire when the id is located, but there's red flags
        //
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SubjectDeceased) },
            name: RuleName::SubjectDeceased,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::AddressInputIsPoBox) },
            name: RuleName::AddressInputIsPoBox,
            action: RuleAction::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::DobLocatedCoppaAlert) },
            name: RuleName::CoppaAlert,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SsnInputIsInvalid) },
            name: RuleName::SsnInputIsInvalid,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SsnLocatedIsInvalid) },
            name: RuleName::SsnLocatedIsInvalid,
            action: RuleAction::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::MultipleRecordsFound) },
            name: RuleName::MultipleRecordsFound,
            action: RuleAction::Fail,
        },
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: { |f: &Vec<FRC>| f.contains(&FRC::SsnIssuedPriorToDob) },
            name: RuleName::SsnIssuedPriorToDob,
            action: RuleAction::Fail,
        },
    ];

    // TODO: rm once we have transitioned to RSG<AML>
    kyc.into_iter()
        .chain(super::common::aml_rules().into_iter())
        .collect()
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

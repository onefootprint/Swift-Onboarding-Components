use newtypes::{FootprintReasonCode, RuleSetName};

use crate::decision::{
    features::{experian::ExperianFeatures, idology_expectid::IDologyFeatures},
    onboarding::FeatureSet,
    rule::{
        rule_set::{Action, Rule, RuleSet},
        RuleName,
    },
};

use super::kyc::{experian_base_rules, idology_base_rules};

// TODO: will add tests for these
pub fn idology_rule_set() -> RuleSet<IDologyFeatures> {
    let hard_fail_rules = idology_base_rules();

    let all_rules = hard_fail_rules
        .into_iter()
        .chain(alpaca_field_validation_rules::<IDologyFeatures>().into_iter())
        .collect();

    RuleSet {
        rules: all_rules,
        name: RuleSetName::AlpacaIdologyRules,
    }
}

pub fn experian_rule_set() -> RuleSet<ExperianFeatures> {
    let hard_fail_rules = experian_base_rules();

    let all_rules = hard_fail_rules
        .into_iter()
        .chain(alpaca_field_validation_rules::<ExperianFeatures>().into_iter())
        .collect();

    RuleSet {
        rules: all_rules,
        name: RuleSetName::AlpacaExperianRules,
    }
}

// Rules for matching various identity data attributes
fn alpaca_field_validation_rules<T: FeatureSet>() -> Vec<Rule<T>> {
    vec![
        Rule {
            rule: {
                |f: &T| {
                    // if it doesn't match exactly, it's a fail
                    !f.footprint_reason_codes()
                        .contains(&FootprintReasonCode::SsnMatches)
                }
            },
            name: RuleName::SsnDoesNotMatch,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &T| {
                    // we can partial match address, so this only triggers if there's no match at all
                    f.footprint_reason_codes()
                        .contains(&FootprintReasonCode::AddressDoesNotMatch)
                        || f.footprint_reason_codes()
                            .contains(&FootprintReasonCode::AddressNewerRecordFound)
                }
            },
            name: RuleName::AddressDoesNotMatch,
            action: Action::StepUp,
        },
        Rule {
            rule: {
                |f: &T| {
                    !f.footprint_reason_codes()
                        .contains(&FootprintReasonCode::NameMatches)
                }
            },
            name: RuleName::NameDoesNotMatch,
            action: Action::StepUp,
        },
        Rule {
            rule: {
                |f: &T| {
                    !f.footprint_reason_codes()
                        .contains(&FootprintReasonCode::DobMatches)
                }
            },
            name: RuleName::DobDoesNotMatch,
            action: Action::StepUp,
        },
    ]
}

use newtypes::{FootprintReasonCode, RuleAction, RuleName, RuleSetName};

use crate::decision::{
    features::{
        experian::ExperianFeatures, idology_expectid::IDologyFeatures, incode_docv::IncodeDocumentFeatures,
    },
    onboarding::FeatureSet,
    rule::rule_set::{Rule, RuleSet},
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

pub fn incode_rule_set() -> RuleSet<IncodeDocumentFeatures> {
    RuleSet {
        rules: vec![],
        name: RuleSetName::AlpacaIncodeRules,
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
            action: RuleAction::Fail,
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
            action: RuleAction::StepUp,
        },
        Rule {
            rule: {
                |f: &T| {
                    !f.footprint_reason_codes()
                        .contains(&FootprintReasonCode::NameMatches)
                }
            },
            name: RuleName::NameDoesNotMatch,
            action: RuleAction::StepUp,
        },
        Rule {
            rule: {
                |f: &T| {
                    !f.footprint_reason_codes()
                        .contains(&FootprintReasonCode::DobMatches)
                }
            },
            name: RuleName::DobDoesNotMatch,
            action: RuleAction::StepUp,
        },
    ]
}

// NEW RULES
#[allow(dead_code)]
pub fn alpaca_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    super::kyc::kyc_rules()
        .into_iter()
        .chain(field_validation_rules().into_iter())
        .collect()
}
#[allow(dead_code)]
fn field_validation_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    vec![
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    // if it doesn't match exactly, it's a fail
                    !f.contains(&FootprintReasonCode::SsnMatches)
                }
            },
            name: RuleName::SsnDoesNotMatch,
            action: RuleAction::Fail,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    // we can partial match address, so this only triggers if there's no match at all
                    f.contains(&FootprintReasonCode::AddressDoesNotMatch)
                        || f.contains(&FootprintReasonCode::AddressNewerRecordFound)
                }
            },
            name: RuleName::AddressDoesNotMatch,
            action: RuleAction::StepUp,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| !f.contains(&FootprintReasonCode::NameMatches) },
            name: RuleName::NameDoesNotMatch,
            action: RuleAction::StepUp,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| !f.contains(&FootprintReasonCode::DobMatches) },
            name: RuleName::DobDoesNotMatch,
            action: RuleAction::StepUp,
        },
    ]
}

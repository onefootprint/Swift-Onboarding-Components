use crate::decision::features::{experian::ExperianFeatures, idology_expectid::IDologyFeatures};

use super::{
    rule_set::{Action, Rule, RuleSet},
    RuleName, RuleSetName,
};
use newtypes::FootprintReasonCode;

pub fn idology_base_rule_set() -> RuleSet<IDologyFeatures> {
    let rules = vec![
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
        // This is an IDology recommended "always fail" rule
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes.iter().any(|rc| {
                        vec![
                            FootprintReasonCode::WatchlistHitOfac,
                            FootprintReasonCode::WatchlistHitNonSdn,
                            FootprintReasonCode::WatchlistHitPep,
                        ]
                        .contains(rc)
                    })
                }
            },
            name: RuleName::WatchlistHit,
            action: Action::Fail,
        },
    ];

    RuleSet {
        rules,
        name: RuleSetName::IdologyBaseRules,
    }
}

pub fn idology_conservative_rule_set() -> RuleSet<IDologyFeatures> {
    let rules = vec![
        Rule {
            rule: { |f: &IDologyFeatures| f.footprint_reason_codes.contains(&FootprintReasonCode::ThinFile) },
            name: RuleName::ThinFile,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::AddressDoesNotMatch)
                }
            },
            name: RuleName::AddressDoesNotMatch,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes.iter().any(|rc| {
                        vec![
                            FootprintReasonCode::AddressLocatedIsNotStandardCampground,
                            FootprintReasonCode::AddressLocatedIsNotStandardCollege,
                            FootprintReasonCode::AddressLocatedIsNotStandardGeneralDelivery,
                            FootprintReasonCode::AddressLocatedIsNotStandardHospital,
                            FootprintReasonCode::AddressLocatedIsNotStandardHotel,
                            FootprintReasonCode::AddressLocatedIsNotStandardMailDrop,
                            FootprintReasonCode::AddressLocatedIsNotStandardPrison,
                            FootprintReasonCode::AddressLocatedIsNotStandardUniversity,
                            FootprintReasonCode::AddressLocatedIsNotStandardUspo,
                        ]
                        .contains(rc)
                    })
                }
            },
            name: RuleName::AddressLocatedIsWarm,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::AddressLocatedIsHighRiskAddress)
                }
            },
            name: RuleName::AddressLocatedIsHighRiskAddress,
            action: Action::Fail,
        },
    ];

    RuleSet {
        rules,
        name: RuleSetName::IdologyConservativeFailingRules,
    }
}

pub fn experian_rules() -> RuleSet<ExperianFeatures> {
    let rule = Rule {
        rule: |f: &ExperianFeatures| {
            f.footprint_reason_codes
                .contains(&FootprintReasonCode::IdNotLocated)
        },
        name: RuleName::IdNotLocated,
        action: Action::Fail,
    };
    RuleSet {
        rules: vec![rule],
        name: RuleSetName::ExperianRules,
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashSet;

    use super::idology_base_rule_set;
    use crate::decision::rule::RuleName;

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

        let rules = HashSet::from_iter(idology_base_rule_set().rules.into_iter().map(|r| r.name));

        assert!(expected_rules.is_subset(&rules))
    }
}

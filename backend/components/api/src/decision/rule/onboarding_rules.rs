use newtypes::DecisionStatus;

use crate::decision::features::IDologyFeatures;

use super::{
    rule_set::{Rule, RuleSet},
    RuleName, RuleSetName,
};
use newtypes::FootprintReasonCode;

pub fn idology_base_rule_set() -> RuleSet<IDologyFeatures> {
    let rules = vec![
        // If we don't have a located identity, we should fail
        Rule {
            rule: { |f: &IDologyFeatures| f.status != DecisionStatus::Pass },
            name: RuleName::IdNotLocated,
        },
        //
        // These rules fire when the id is located, but there's red flags
        //
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SubjectDeceased)
                }
            },
            name: RuleName::SubjectDeceased,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::AddressInputIsPoBox)
                }
            },
            name: RuleName::AddressInputIsPoBox,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::DobLocatedCoppaAlert)
                }
            },
            name: RuleName::CoppaAlert,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    // it does not match, and it is not a close mismatch
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnDoesNotMatch)
                        && !f
                            .footprint_reason_codes
                            .contains(&FootprintReasonCode::SsnDoesNotMatchWithin1Digit)
                }
            },
            name: RuleName::SsnDoesNotMatch,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnInputIsInvalid)
                }
            },
            name: RuleName::SsnInputIsInvalid,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnLocatedIsInvalid)
                }
            },
            name: RuleName::SsnLocatedIsInvalid,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnIssuedPriorToDob)
                }
            },
            name: RuleName::SsnIssuedPriorToDob,
        },
        Rule {
            rule: { |f: &IDologyFeatures| f.watchlist_max_score.map(|s| s > 93).unwrap_or(false) },
            name: RuleName::WatchlistHit,
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
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::AddressDoesNotMatch)
                }
            },
            name: RuleName::AddressDoesNotMatch,
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
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::AddressLocatedIsHighRiskAddress)
                }
            },
            name: RuleName::AddressLocatedIsHighRiskAddress,
        },
    ];

    RuleSet {
        rules,
        name: RuleSetName::IdologyConservativeFailingRules,
    }
}

// will remove once we make sure the score based rule is working
pub fn temp_watchlist() -> RuleSet<IDologyFeatures> {
    let rule = Rule {
        rule: |f: &IDologyFeatures| {
            f.footprint_reason_codes
                .contains(&FootprintReasonCode::PotentialWatchlistHit)
        },
        name: RuleName::WatchlistHit,
    };
    RuleSet {
        rules: vec![rule],
        name: RuleSetName::TempWatchlist,
    }
}

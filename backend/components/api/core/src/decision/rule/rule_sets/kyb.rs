use crate::decision::features::kyb_features::KybFeatureVector;

use crate::decision::rule::{
    rule_set::{Action, Rule, RuleSet},
    RuleName,
};
use newtypes::{DecisionStatus, FootprintReasonCode, RuleSetName};

pub fn bos_pass_kyc_rule_set() -> RuleSet<KybFeatureVector> {
    let rules = vec![Rule {
        rule: {
            |f: &KybFeatureVector| {
                f.bo_obds.iter().any(|o| o.status != DecisionStatus::Pass) || f.bo_obds.is_empty()
                // is_empty should be validated elsewhere, but extra check doesn't hurt here
            }
        },
        name: RuleName::BoNonPassingKyc,
        action: Action::Fail,
    }];

    RuleSet {
        rules,
        name: RuleSetName::BosMustPassKycRules,
    }
}

pub fn middesk_base_rule_set() -> RuleSet<KybFeatureVector> {
    let rules = vec![
        // Based on Middek's Default Auto Approval policy
        Rule {
            rule: {
                |f: &KybFeatureVector| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::BusinessNameWatchlistHit)
                }
            },
            name: RuleName::BusinessWatchlistHit,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &KybFeatureVector| !f.footprint_reason_codes.contains(&FootprintReasonCode::TinMatch)
            },
            name: RuleName::NoTinMatch,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &KybFeatureVector| {
                    !f.footprint_reason_codes.iter().any(|rc| {
                        vec![
                            FootprintReasonCode::BusinessNameMatch,
                            FootprintReasonCode::BusinessNameSimilarMatch,
                        ]
                        .contains(rc)
                    })
                }
            },
            name: RuleName::NoBusinessNameMatch,
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &KybFeatureVector| {
                    !f.footprint_reason_codes.iter().any(|rc| {
                        vec![
                            FootprintReasonCode::BusinessAddressMatch,
                            FootprintReasonCode::BusinessAddressCloseMatch,
                            FootprintReasonCode::BusinessAddressSimilarMatch,
                        ]
                        .contains(rc)
                    })
                }
            },
            name: RuleName::NoBusinessAddressMatch,
            action: Action::Fail,
        },
    ];

    RuleSet {
        rules,
        name: RuleSetName::MiddeskBaseRules,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::decision::rule::rules_engine;
    use test_case::test_case;

    fn middesk_features(fp_reason_codes: Vec<FootprintReasonCode>) -> KybFeatureVector {
        KybFeatureVector {
            footprint_reason_codes: fp_reason_codes,
            bo_obds: vec![],
        }
    }

    #[test_case(middesk_features(vec![FootprintReasonCode::TinMatch, FootprintReasonCode::BusinessNameMatch, FootprintReasonCode::BusinessAddressMatch]) => None; "everything matches")]
    #[test_case(middesk_features(vec![FootprintReasonCode::TinMatch, FootprintReasonCode::BusinessNameSimilarMatch, FootprintReasonCode::BusinessAddressCloseMatch]) => None; "everything closely matches")]
    #[test_case(middesk_features(vec![FootprintReasonCode::TinMatch, FootprintReasonCode::BusinessNameSimilarMatch, FootprintReasonCode::BusinessAddressDoesNotMatch]) => Some(Action::Fail); "biz address doesn't match")]
    #[test_case(middesk_features(vec![FootprintReasonCode::BusinessNameMatch, FootprintReasonCode::BusinessAddressMatch]) => Some(Action::Fail); "no tin match")]
    #[test_case(middesk_features(vec![FootprintReasonCode::TinMatch, FootprintReasonCode::BusinessNameMatch, FootprintReasonCode::BusinessAddressMatch, FootprintReasonCode::BusinessNameWatchlistHit]) => Some(Action::Fail); "watchlist hit")]
    fn test_middesk_base_rule_set(kyb_fv: KybFeatureVector) -> Option<Action> {
        rules_engine::evaluate_onboarding_rules(vec![middesk_base_rule_set()], &kyb_fv).triggered_action
    }
}

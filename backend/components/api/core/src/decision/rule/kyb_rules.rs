use crate::decision::features::kyb_features::MiddeskFeatures;

use super::{
    rule_set::{Rule, RuleSet},
    RuleName, RuleSetName,
};
use newtypes::FootprintReasonCode;

pub fn middesk_base_rule_set() -> RuleSet<MiddeskFeatures> {
    let rules = vec![
        // Based on Middek's Default Auto Approval policy
        Rule {
            rule: {
                |f: &MiddeskFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::BusinessNameWatchlistHit)
                }
            },
            name: RuleName::BusinessWatchlistHit,
        },
        Rule {
            rule: {
                |f: &MiddeskFeatures| !f.footprint_reason_codes.contains(&FootprintReasonCode::TinMatch)
            },
            name: RuleName::NoTinMatch,
        },
        Rule {
            rule: {
                |f: &MiddeskFeatures| {
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
        },
        Rule {
            rule: {
                |f: &MiddeskFeatures| {
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
    use newtypes::VerificationResultId;
    use std::str::FromStr;
    use test_case::test_case;

    fn middesk_features(fp_reason_codes: Vec<FootprintReasonCode>) -> MiddeskFeatures {
        MiddeskFeatures {
            footprint_reason_codes: fp_reason_codes,
            verification_result_id: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d")
                .unwrap(),
        }
    }

    #[test_case(middesk_features(vec![FootprintReasonCode::TinMatch, FootprintReasonCode::BusinessNameMatch, FootprintReasonCode::BusinessAddressMatch]) => false)]
    #[test_case(middesk_features(vec![FootprintReasonCode::TinMatch, FootprintReasonCode::BusinessNameSimilarMatch, FootprintReasonCode::BusinessAddressCloseMatch]) => false)]
    #[test_case(middesk_features(vec![FootprintReasonCode::TinMatch, FootprintReasonCode::BusinessNameSimilarMatch, FootprintReasonCode::BusinessAddressDoesNotMatch]) => true)]
    #[test_case(middesk_features(vec![FootprintReasonCode::BusinessNameMatch, FootprintReasonCode::BusinessAddressMatch]) => true)]
    #[test_case(middesk_features(vec![FootprintReasonCode::TinMatch, FootprintReasonCode::BusinessNameMatch, FootprintReasonCode::BusinessAddressMatch, FootprintReasonCode::BusinessNameWatchlistHit]) => true)]
    fn test_idology_base_rule_set(middesk_features: MiddeskFeatures) -> bool {
        rules_engine::evaluate_onboarding_rules(vec![Box::new(middesk_base_rule_set())], &middesk_features)
            .triggered
    }
}

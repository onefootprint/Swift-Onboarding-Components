use newtypes::FootprintReasonCode;

use crate::decision::{
    onboarding::FeatureSet,
    rule::{
        rule_set::{Action, Rule},
        RuleName,
    },
};

pub fn watchlist_hit_rule<T: FeatureSet + Clone>() -> Rule<T> {
    Rule {
        rule: {
            |f: &T| {
                f.footprint_reason_codes().iter().any(|rc| {
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
        action: Action::ManualReview,
    }
}

// NEW RULES
pub fn aml_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    vec![
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.iter().any(|rc| {
                        vec![
                            FootprintReasonCode::WatchlistHitOfac,
                            FootprintReasonCode::WatchlistHitNonSdn,
                        ]
                        .contains(rc)
                    })
                }
            },
            name: RuleName::WatchlistHit,
            action: Action::ManualReview,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::WatchlistHitPep) },
            name: RuleName::PepHit,
            action: Action::ManualReview,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::AdverseMediaHit) },
            name: RuleName::AdverseMediaHit,
            action: Action::ManualReview,
        },
    ]
}

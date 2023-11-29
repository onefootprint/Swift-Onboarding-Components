use newtypes::{FootprintReasonCode, RuleAction, RuleName};

use crate::decision::{onboarding::FeatureSet, rule::rule_set::Rule};

pub fn watchlist_hit_rule<T: FeatureSet + Clone>() -> Rule<T> {
    Rule {
        rule: {
            |f: &T| {
                f.footprint_reason_codes().iter().any(|rc| {
                    [
                        FootprintReasonCode::WatchlistHitOfac,
                        FootprintReasonCode::WatchlistHitWarning,
                        FootprintReasonCode::WatchlistHitNonSdn,
                        FootprintReasonCode::WatchlistHitPep,
                    ]
                    .contains(rc)
                })
            }
        },
        name: RuleName::WatchlistHit,
        action: RuleAction::ManualReview,
    }
}

// NEW RULES
pub fn aml_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    vec![
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.iter().any(|rc| {
                        [
                            FootprintReasonCode::WatchlistHitOfac,
                            FootprintReasonCode::WatchlistHitWarning,
                            FootprintReasonCode::WatchlistHitNonSdn,
                        ]
                        .contains(rc)
                    })
                }
            },
            name: RuleName::WatchlistHit,
            action: RuleAction::ManualReview,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::WatchlistHitPep) },
            name: RuleName::PepHit,
            action: RuleAction::ManualReview,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::AdverseMediaHit) },
            name: RuleName::AdverseMediaHit,
            action: RuleAction::ManualReview,
        },
    ]
}

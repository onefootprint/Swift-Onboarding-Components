use newtypes::{FootprintReasonCode, RuleAction, RuleName};

use crate::decision::rule::rule_set::Rule;

pub fn alpaca_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    super::kyc::kyc_rules()
        .into_iter()
        .chain(field_validation_rules())
        .collect()
}
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

pub fn doc_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    super::doc::incode_rules(true)
        .into_iter()
        .chain(doc_field_validation_rules())
        .collect()
}

pub fn doc_field_validation_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    vec![
        // TODO: 🤔 should these technically do stuff like !DocumentOcrNameMatches && !NameDoesNotMatch ?
        // what happens when the KYC check says DOB matches but then they upload a doc that has a different DOB 🤔. For now we'll just fail with review for these cases but maybe something to explicitly ask Alpaca about
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| !f.contains(&FootprintReasonCode::DocumentOcrAddressMatches)
            },
            name: RuleName::DocumentAddressDoesntMatch,
            action: RuleAction::ManualReview,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| !f.contains(&FootprintReasonCode::DocumentOcrDobMatches) },
            name: RuleName::DocumentDobDoesntMatch,
            action: RuleAction::ManualReview,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| !f.contains(&FootprintReasonCode::DocumentOcrNameMatches)
            },
            name: RuleName::DocumentNameDoesntMatch,
            action: RuleAction::ManualReview,
        },
    ]
}

pub fn stepup_on_watchlist_hit_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    vec![Rule {
        rule: {
            |f: &Vec<FootprintReasonCode>| {
                f.iter().any(|rc| {
                    [
                        FootprintReasonCode::WatchlistHitOfac,
                        FootprintReasonCode::WatchlistHitNonSdn,
                        FootprintReasonCode::WatchlistHitPep,
                        FootprintReasonCode::AdverseMediaHit,
                    ]
                    .contains(rc)
                })
            }
        },
        name: RuleName::WatchlistHitStepUp,
        action: RuleAction::StepUp,
    }]
}

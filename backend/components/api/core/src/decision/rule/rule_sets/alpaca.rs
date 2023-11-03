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
    vec![Rule {
        // A little hacky but a way to always raise review if we collected doc, which is the existing spec we implemented for Follow. Soon to be replaced with auto-approval rules.
        rule: {
            |f: &Vec<FootprintReasonCode>| {
                f.contains(&FootprintReasonCode::DocumentNotVerified)
                    || f.contains(&FootprintReasonCode::DocumentVerified)
                    || f.contains(&FootprintReasonCode::DocumentUploadFailed)
            }
        },
        name: RuleName::DocumentCollected,
        action: RuleAction::ManualReview,
    }]
}

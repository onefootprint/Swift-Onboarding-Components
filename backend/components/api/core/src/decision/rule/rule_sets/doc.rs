use crate::decision::rule::rule_set::Rule;
use newtypes::{RuleAction, RuleName};

use newtypes::FootprintReasonCode;

// we use this base set of Document rules for both Alpaca and regular playbooks. However, precedent for Alpaca currently is to always
// raise a review if a doc was uploaded. We haven't yet decided with folks that there are cases where they want a document to "hard fail" and not even raise a review
// so for now, the alpaca rules will pass in always_review=true here and that means would be Fail RuleAction's here are instead RuleAction::ManualReview
pub fn incode_rules(always_review: bool) -> Vec<Rule<Vec<FootprintReasonCode>>> {
    let fail_action = match always_review {
        true => RuleAction::ManualReview,
        false => RuleAction::Fail,
    };
    vec![
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::DocumentNotVerified) },
            name: RuleName::DocumentNotVerified,
            action: fail_action,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.contains(&FootprintReasonCode::DocumentSelfieDoesNotMatch)
                    // Only written when there's a selfie in the verification session
                }
            },
            name: RuleName::SelfieDoesNotMatch,
            action: fail_action,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.contains(&FootprintReasonCode::DocumentSelfieNotLiveImage)
                    // Only written when there's a selfie in the verification session
                }
            },
            name: RuleName::SelfieIsNotLive,
            action: RuleAction::ManualReview,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::DocumentUploadFailed) },
            name: RuleName::DocumentUploadFailed,
            action: RuleAction::ManualReview,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::DocumentExpired) },
            name: RuleName::DocumentExpired,
            action: fail_action,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.iter().any(|rc| {
                        [
                            FootprintReasonCode::DocumentTypeMismatch,
                            FootprintReasonCode::DocumentUnknownCountryCode,
                            FootprintReasonCode::DocumentCountryCodeMismatch,
                        ]
                        .contains(rc)
                    })
                }
            },
            name: RuleName::DocumentCollectionErrored,
            action: RuleAction::ManualReview,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.contains(&FootprintReasonCode::DocumentIsPermitOrProvisionalLicense)
                }
            },
            name: RuleName::DocumentWasLearnerPermit,
            action: RuleAction::PassWithManualReview,
        },
    ]
}

use crate::decision::{
    features::incode_docv::IncodeDocumentFeatures,
    rule::rule_set::{Rule, RuleSet},
};
use newtypes::{RuleAction, RuleName};

use newtypes::{FootprintReasonCode, RuleSetName};

// what is this
pub fn incode_base_rules() -> Vec<Rule<IncodeDocumentFeatures>> {
    vec![
        Rule {
            rule: {
                |f: &IncodeDocumentFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::DocumentNotVerified)
                }
            },
            name: RuleName::DocumentNotVerified,
            action: RuleAction::Fail,
        },
        Rule {
            rule: {
                |f: &IncodeDocumentFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::DocumentSelfieDoesNotMatch)
                    // Only written when there's a selfie in the verification session
                }
            },
            name: RuleName::SelfieDoesNotMatch,
            action: RuleAction::Fail,
        },
    ]
}

pub fn incode_rule_set() -> RuleSet<IncodeDocumentFeatures> {
    let rules = incode_base_rules();

    RuleSet {
        rules,
        name: RuleSetName::IncodeRules,
    }
}

// NEW RULES
pub fn incode_rules() -> Vec<Rule<Vec<FootprintReasonCode>>> {
    vec![
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::DocumentNotVerified) },
            name: RuleName::DocumentNotVerified,
            action: RuleAction::Fail,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.contains(&FootprintReasonCode::DocumentSelfieDoesNotMatch)
                    // Only written when there's a selfie in the verification session
                }
            },
            name: RuleName::SelfieDoesNotMatch,
            action: RuleAction::Fail,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::DocumentUploadFailed) },
            name: RuleName::DocumentUploadFailed,
            action: RuleAction::ManualReview,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::DocumentExpired) },
            name: RuleName::DocumentExpired,
            action: RuleAction::Fail,
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

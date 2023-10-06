use crate::decision::{
    features::incode_docv::IncodeDocumentFeatures,
    rule::{
        rule_set::{Action, Rule, RuleSet},
        RuleName,
    },
};

use newtypes::{FootprintReasonCode, RuleSetName};

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
            action: Action::Fail,
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
            action: Action::Fail,
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
            action: Action::Fail,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.contains(&FootprintReasonCode::DocumentSelfieDoesNotMatch)
                    // Only written when there's a selfie in the verification session
                }
            },
            name: RuleName::SelfieDoesNotMatch,
            action: Action::Fail,
        },
        Rule {
            rule: { |f: &Vec<FootprintReasonCode>| f.contains(&FootprintReasonCode::DocumentUploadFailed) },
            name: RuleName::DocumentUploadFailed,
            action: Action::ManualReview,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.iter().any(|rc| {
                        vec![
                            FootprintReasonCode::DocumentTypeMismatch,
                            FootprintReasonCode::DocumentUnknownCountryCode,
                            FootprintReasonCode::DocumentCountryCodeMismatch,
                        ]
                        .contains(rc)
                    })
                }
            },
            name: RuleName::DocumentCollectionErrored,
            action: Action::ManualReview,
        },
        Rule {
            rule: {
                |f: &Vec<FootprintReasonCode>| {
                    f.contains(&FootprintReasonCode::DocumentIsPermitOrProvisionalLicense)
                }
            },
            name: RuleName::DocumentWasLearnerPermit,
            action: Action::ManualReview,
        },
    ]
}

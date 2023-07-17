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

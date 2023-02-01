use super::rule_set::*;
use crate::decision::features::IDologyFeatures;
use newtypes::{DecisionStatus, FootprintReasonCode};

pub fn idology_rule_set() -> RuleSet<IDologyFeatures> {
    let failing_rules = vec![
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SubjectDeceased)
                }
            },
            name: "subject.deceased".into(),
            outcome: RuleOutcome::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::AddressInputIsPoBox)
                }
            },
            name: "address.is_po_box".into(),
            outcome: RuleOutcome::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::DobLocatedCoppaAlert)
                }
            },
            name: "coppa.alert".into(),
            outcome: RuleOutcome::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    // it does not match, and it is not a close mismatch
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnDoesNotMatch)
                        && !f
                            .footprint_reason_codes
                            .contains(&FootprintReasonCode::SsnDoesNotMatchWithin1Digit)
                }
            },
            name: "ssn.does_not_match".into(),
            outcome: RuleOutcome::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnInputIsInvalid)
                }
            },
            name: "ssn.invalid".into(),
            outcome: RuleOutcome::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnLocatedIsInvalid)
                }
            },
            name: "ssn.located.invalid".into(),
            outcome: RuleOutcome::Fail,
        },
        Rule {
            rule: {
                |f: &IDologyFeatures| {
                    f.footprint_reason_codes
                        .contains(&FootprintReasonCode::SsnIssuedPriorToDob)
                }
            },
            name: "ssn.issued_prior_to_dob".into(),
            outcome: RuleOutcome::Fail,
        },
    ];

    let passing_rules = vec![Rule {
        rule: { |f: &IDologyFeatures| f.status == DecisionStatus::Pass },
        name: "status.id_located".into(),
        outcome: RuleOutcome::Pass,
    }];

    let rules: Vec<Rule<IDologyFeatures>> = failing_rules
        .into_iter()
        .chain(passing_rules.into_iter())
        .collect();

    RuleSet {
        rules,
        name: "IdologyRules".to_string().into(),
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::decision::features::IDologyFeatures;
    use newtypes::{DecisionStatus, FootprintReasonCode, IDologyReasonCode, VerificationResultId};
    use std::str::FromStr;

    #[test]
    fn test_idology_rule_set() {
        // Set up a feature vector
        let idology_features = IDologyFeatures {
            status: DecisionStatus::Pass,
            create_manual_review: false,
            id_located: true,
            is_id_scan_required: false,
            id_number_for_scan_required: Some(3010453),
            reason_codes: vec![
                IDologyReasonCode::CorporateEmailDomain,
                IDologyReasonCode::StreetNameDoesNotMatch,
            ],
            footprint_reason_codes: vec![
                FootprintReasonCode::AddressInputIsPoBox,
                FootprintReasonCode::SubjectDeceased,
            ],
            verification_result: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d")
                .unwrap(),
        };

        let res = idology_rule_set().evaluate(&idology_features);

        // we expect 2 failing rules triggered
        assert_eq!(
            res.failing_rules_triggered,
            vec!["subject.deceased".to_string(), "address.is_po_box".to_string()]
        );
        // and 1 passing rule
        assert_eq!(res.passing_rules_triggered, vec!["status.id_located".to_string()]);

        // Other rules weren't triggered
        assert_eq!(
            res.rules_not_triggered,
            vec![
                "coppa.alert",
                "ssn.does_not_match",
                "ssn.invalid",
                "ssn.located.invalid",
                "ssn.issued_prior_to_dob"
            ]
            .iter()
            .map(|s| s.to_string())
            .collect::<Vec<String>>()
        );
    }
}

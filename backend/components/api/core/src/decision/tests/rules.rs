use std::str::FromStr;

use newtypes::{FootprintReasonCode, VerificationResultId};

use crate::decision::{
    features::idology_expectid::IDologyFeatures,
    rule::{onboarding_rules::idology_base_rule_set, rules_engine::evaluate_onboarding_rules},
};
use test_case::test_case;

fn idology_features(fp_reason_codes: Vec<FootprintReasonCode>) -> IDologyFeatures {
    IDologyFeatures {
        footprint_reason_codes: fp_reason_codes,
        id_number_for_scan_required: None,
        is_id_scan_required: false,
        verification_result: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap(),
    }
}

// if no id located, we fail.
#[test_case(idology_features(vec![FootprintReasonCode::IdNotLocated]) => true)]
// High watchlist score
#[test_case(idology_features(vec![FootprintReasonCode::WatchlistHitOfac]) => true)]
#[test_case(idology_features(vec![FootprintReasonCode::SubjectDeceased]) => true)]
// SSN rules
#[test_case(idology_features(vec![FootprintReasonCode::SsnDoesNotMatch]) => true)]
#[test_case(idology_features(vec![FootprintReasonCode::SsnDoesNotMatchWithin1Digit]) => false)]
#[test_case(idology_features(vec![FootprintReasonCode::SsnLocatedIsInvalid]) => true)]
#[test_case(idology_features(vec![FootprintReasonCode::SsnIssuedPriorToDob]) => true)]

fn test_idology_base_rule_set(idology_features: IDologyFeatures) -> bool {
    evaluate_onboarding_rules(vec![Box::new(idology_base_rule_set())], &idology_features).triggered
}

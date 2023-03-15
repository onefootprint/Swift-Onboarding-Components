use std::str::FromStr;

use newtypes::{DecisionStatus, FootprintReasonCode, VerificationResultId};

use crate::decision::{
    features::idology_expectid::IDologyFeatures,
    rule::{onboarding_rules::idology_base_rule_set, rules_engine::evaluate_onboarding_rules},
};
use test_case::test_case;

fn idology_features(status: DecisionStatus, fp_reason_codes: Vec<FootprintReasonCode>) -> IDologyFeatures {
    IDologyFeatures {
        status,
        footprint_reason_codes: fp_reason_codes,
        id_located: true,
        id_number_for_scan_required: None,
        is_id_scan_required: false,
        verification_result: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap(),
        create_manual_review: false,
    }
}

// if no id located, we fail.
#[test_case(idology_features(DecisionStatus::Fail, vec![]) => true)]
// High watchlist score
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::WatchlistHit]) => true)]
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::PotentialWatchlistHit]) => false)]
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SubjectDeceased]) => true)]
// SSN rules
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SsnDoesNotMatch]) => true)]
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SsnDoesNotMatchWithin1Digit]) => false)]
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SsnLocatedIsInvalid]) => true)]
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SsnIssuedPriorToDob]) => true)]

fn test_idology_base_rule_set(idology_features: IDologyFeatures) -> bool {
    evaluate_onboarding_rules(vec![idology_base_rule_set()], &idology_features).triggered
}

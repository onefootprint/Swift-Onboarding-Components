use std::str::FromStr;

use newtypes::{DecisionStatus, FootprintReasonCode, OnboardingId, VerificationResultId};

use crate::decision::{
    features::IDologyFeatures,
    rule::{evaluate_onboarding_rules, onboarding_rules::idology_base_rule_set},
};
use test_case::test_case;

fn idology_features(
    status: DecisionStatus,
    fp_reason_codes: Vec<FootprintReasonCode>,
    watchlist_potential_hit: bool,
    watchlist_max_score: Option<i32>,
) -> IDologyFeatures {
    IDologyFeatures {
        status,
        footprint_reason_codes: fp_reason_codes,
        id_located: true,
        id_number_for_scan_required: None,
        is_id_scan_required: false,
        verification_result: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap(),
        create_manual_review: false,
        watchlist_potential_hit,
        watchlist_max_score,
    }
}

// if no id located, we fail.
#[test_case(idology_features(DecisionStatus::Fail, vec![], false, None) => true)]
// High watchlist score
#[test_case(idology_features(DecisionStatus::Pass, vec![], false, Some(94)) => true)]
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SubjectDeceased], false, None) => true)]
// SSN rules
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SsnDoesNotMatch], false, None) => true)]
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SsnDoesNotMatchWithin1Digit], false, None) => false)]
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SsnLocatedIsInvalid], false, None) => true)]
#[test_case(idology_features(DecisionStatus::Pass, vec![FootprintReasonCode::SsnIssuedPriorToDob], false, None) => true)]

fn test_idology_base_rule_set(idology_features: IDologyFeatures) -> bool {
    evaluate_onboarding_rules(
        vec![idology_base_rule_set()],
        &idology_features,
        &OnboardingId::from_str("ob1").unwrap(),
    )
}

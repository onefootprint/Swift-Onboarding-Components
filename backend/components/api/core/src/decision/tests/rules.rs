use crate::decision::{
    features::idology_expectid::IDologyFeatures,
    rule::{rule_set::Action, rule_sets::kyc::idology_rule_set, rules_engine::evaluate_onboarding_rules},
};
use newtypes::{FootprintReasonCode, VerificationResultId};
use std::str::FromStr;
use test_case::test_case;

fn idology_features(fp_reason_codes: Vec<FootprintReasonCode>) -> IDologyFeatures {
    IDologyFeatures {
        footprint_reason_codes: fp_reason_codes,
        verification_result_id: VerificationResultId::from_str("vres123").unwrap(),
    }
}

// if no id located, we fail.
#[test_case(idology_features(vec![FootprintReasonCode::IdNotLocated]) => Some(Action::Fail))]
// High watchlist score
#[test_case(idology_features(vec![FootprintReasonCode::WatchlistHitOfac]) => Some(Action::ManualReview))]
#[test_case(idology_features(vec![FootprintReasonCode::SubjectDeceased]) => Some(Action::Fail))]
// SSN rules
#[test_case(idology_features(vec![FootprintReasonCode::SsnDoesNotMatch]) => Some(Action::Fail))]
#[test_case(idology_features(vec![FootprintReasonCode::SsnDoesNotMatchWithin1Digit]) => None)]
#[test_case(idology_features(vec![FootprintReasonCode::SsnLocatedIsInvalid]) => Some(Action::Fail))]
#[test_case(idology_features(vec![FootprintReasonCode::SsnIssuedPriorToDob]) => Some(Action::Fail))]

fn test_idology_base_rule_set(idology_features: IDologyFeatures) -> Option<Action> {
    evaluate_onboarding_rules(vec![idology_rule_set()], &idology_features).triggered_action
}

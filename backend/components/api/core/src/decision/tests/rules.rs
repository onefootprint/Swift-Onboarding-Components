use crate::decision::{
    features::idology_expectid::IDologyFeatures,
    rule::{rule_sets::kyc::idology_rule_set, rules_engine::evaluate_onboarding_rules},
};
use newtypes::{FootprintReasonCode, RuleAction, VerificationResultId};
use std::str::FromStr;
use test_case::test_case;

fn idology_features(fp_reason_codes: Vec<FootprintReasonCode>) -> IDologyFeatures {
    IDologyFeatures {
        footprint_reason_codes: fp_reason_codes,
        verification_result_id: VerificationResultId::from_str("vres123").unwrap(),
    }
}

// if no id located, we fail.
#[test_case(idology_features(vec![FootprintReasonCode::IdNotLocated]) => Some(RuleAction::Fail))]
// High watchlist score
#[test_case(idology_features(vec![FootprintReasonCode::WatchlistHitOfac]) => Some(RuleAction::ManualReview))]
#[test_case(idology_features(vec![FootprintReasonCode::SubjectDeceased]) => Some(RuleAction::Fail))]
// SSN rules
#[test_case(idology_features(vec![FootprintReasonCode::SsnDoesNotMatch]) => Some(RuleAction::Fail))]
#[test_case(idology_features(vec![FootprintReasonCode::SsnDoesNotMatchWithin1Digit]) => None)]
#[test_case(idology_features(vec![FootprintReasonCode::SsnLocatedIsInvalid]) => Some(RuleAction::Fail))]
#[test_case(idology_features(vec![FootprintReasonCode::SsnIssuedPriorToDob]) => Some(RuleAction::Fail))]

fn test_idology_base_rule_set(idology_features: IDologyFeatures) -> Option<RuleAction> {
    evaluate_onboarding_rules(vec![idology_rule_set()], &idology_features).triggered_action
}

use crate::decision::risk::evaluate_onboarding_rules;
use feature_flag::BoolFlag;
use newtypes::{DecisionStatus, FootprintReasonCode};
use std::str::FromStr;
use test_case::test_case;

// these tests kinda stink, need to refactor
fn idology_reason_codes(should_fail: bool, should_fail_conservative: bool) -> Vec<FootprintReasonCode> {
    let mut codes = vec![];
    if should_fail {
        codes.push(FootprintReasonCode::SubjectDeceased);
    }
    if should_fail_conservative {
        codes.push(FootprintReasonCode::AddressLocatedIsHighRiskAddress);
    }

    codes
}
type CreateManualReview = bool;
// passing status but hit a conservative rule -> fail
#[test_case(true, true, false, DecisionStatus::Pass => (DecisionStatus::Fail, true))]
// passing status but hit a base rule -> fail
#[test_case(true, false, true, DecisionStatus::Pass => (DecisionStatus::Fail, true))]
// failing status and hit no rules -> fail (needs a pass)
#[test_case(true, false, false, DecisionStatus::Fail => (DecisionStatus::Fail, true))]
// // passing status and hit no rules -> pass
#[test_case(true, false, false, DecisionStatus::Pass => (DecisionStatus::Pass, false))]
// don't use rule flags, but we still pass because the passing rules are permanent
#[test_case(false, false, true, DecisionStatus::Pass => (DecisionStatus::Pass, false))]
// don't use rule flags, and we still fail bc idology failed
#[test_case(false, true, true, DecisionStatus::Fail => (DecisionStatus::Fail, true))]
fn test_final_decision(
    should_use_conservative_rules: bool,
    base_rules_should_fail: bool,
    conservative_rules_should_fail: bool,
    idology_status: DecisionStatus,
) -> (DecisionStatus, CreateManualReview) {
    use crate::decision::{
        features::{FeatureVector, IDologyFeatures},
        rule::onboarding_rules,
    };
    use feature_flag::MockFeatureFlagClient;
    use newtypes::VerificationResultId;

    // Set up a feature vector
    let idology_features = IDologyFeatures {
        status: idology_status,
        create_manual_review: false,
        id_located: true,
        is_id_scan_required: false,
        id_number_for_scan_required: Some(3010453),
        footprint_reason_codes: idology_reason_codes(base_rules_should_fail, conservative_rules_should_fail),
        verification_result: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap(),
    };

    let feature_vector = FeatureVector {
        idology_features: Some(idology_features),
        ..Default::default()
    };

    let mut mock_ff_client = MockFeatureFlagClient::new();
    // this is a permanent rule so we never request this flag value
    mock_ff_client
        .expect_flag()
        .withf(|f| *f == BoolFlag::EnableRuleSetForDecision(&onboarding_rules::idology_base_rule_set().name))
        .never();

    mock_ff_client
        .expect_flag()
        .withf(|f| {
            *f == BoolFlag::EnableRuleSetForDecision(&onboarding_rules::idology_conservative_rule_set().name)
        })
        .times(1)
        .return_once(move |_| should_use_conservative_rules);
    mock_ff_client
        .expect_flag()
        .withf(|f| *f == BoolFlag::EnableRuleSetForDecision(&onboarding_rules::temp_watchlist().name))
        .times(1)
        .return_once(move |_| should_use_conservative_rules);

    // function under test
    let d = evaluate_onboarding_rules(&feature_vector, &mock_ff_client).unwrap();

    assert!(!d.rules_not_triggered.is_empty());
    if d.decision_status == DecisionStatus::Fail {
        assert!(!d.rules_triggered.is_empty())
    }

    (d.decision_status, d.create_manual_review)
}

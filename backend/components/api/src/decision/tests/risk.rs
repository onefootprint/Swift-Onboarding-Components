use std::str::FromStr;

use newtypes::{DecisionStatus, FootprintReasonCode, OnboardingId};
use test_case::test_case;

use crate::{
    decision::risk::{final_decision, DecisionOutput},
    feature_flag::FeatureFlagError,
};
fn ob_id(id: &str) -> OnboardingId {
    OnboardingId::from_str(id).unwrap()
}

fn idology_reason_codes(should_fail: bool) -> Vec<FootprintReasonCode> {
    if should_fail {
        vec![FootprintReasonCode::SubjectDeceased]
    } else {
        vec![]
    }
}
#[test_case(Ok(true), DecisionStatus::Pass, true => DecisionOutput {decision_status: DecisionStatus::Fail, onboarding_id: ob_id("ob1"), create_manual_review: true})]
#[test_case(Ok(false), DecisionStatus::Pass, true  => DecisionOutput {decision_status: DecisionStatus::Pass, onboarding_id: ob_id("ob1"), create_manual_review: false})]
#[test_case(Ok(false), DecisionStatus::Fail, true  => DecisionOutput {decision_status: DecisionStatus::Fail, onboarding_id: ob_id("ob1"), create_manual_review: true})]
#[test_case(Ok(true), DecisionStatus::Pass, false => DecisionOutput {decision_status: DecisionStatus::Pass, onboarding_id: ob_id("ob1"), create_manual_review: false})]
fn test_final_decision(
    should_use_rules_ff_response: Result<bool, FeatureFlagError>,
    decision_status_from_features: DecisionStatus,
    rules_should_fail: bool,
) -> DecisionOutput {
    use crate::{
        decision::{
            features::{FeatureVector, IDologyFeatures},
            rule::rule_impl::idology_rule_set,
        },
        feature_flag::MockFeatureFlagClient,
    };
    use mockall::predicate::*;
    use newtypes::VerificationResultId;

    // Set up a feature vector
    let idology_features = IDologyFeatures {
        status: decision_status_from_features,
        create_manual_review: false,
        id_located: true,
        is_id_scan_required: false,
        id_number_for_scan_required: Some(3010453),
        reason_codes: vec![],
        footprint_reason_codes: idology_reason_codes(rules_should_fail),
        verification_result: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap(),
    };

    let feature_vector = FeatureVector {
        idology_features: Some(idology_features),
        ..Default::default()
    };

    let mut mock_ff_client = MockFeatureFlagClient::new();

    mock_ff_client
        .expect_bool_flag_by_rule_set_name()
        .with(eq("EnableRuleSetForDecision"), eq(idology_rule_set().name))
        .times(1)
        .return_once(|_, _| should_use_rules_ff_response);

    // function under test
    final_decision(&feature_vector, ob_id("ob1"), &mock_ff_client).unwrap()
}

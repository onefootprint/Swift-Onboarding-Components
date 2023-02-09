use std::str::FromStr;

use newtypes::{DecisionStatus, FootprintReasonCode, OnboardingId};
use test_case::test_case;

use crate::decision::risk::{final_decision, DecisionOutput};
fn ob_id(id: &str) -> OnboardingId {
    OnboardingId::from_str(id).unwrap()
}

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

// passing status but hit a conservative rule -> fail
#[test_case(true, true, false, DecisionStatus::Pass, ob_id("ob1") => DecisionOutput {decision_status: DecisionStatus::Fail, onboarding_id: ob_id("ob1"), create_manual_review: true})]
// passing status but hit a base rule -> fail
#[test_case(true, false, true, DecisionStatus::Pass, ob_id("ob2") => DecisionOutput {decision_status: DecisionStatus::Fail, onboarding_id: ob_id("ob2"), create_manual_review: true})]
// failing status and hit no rules -> fail (needs a pass)
#[test_case(true, false, false, DecisionStatus::Fail, ob_id("ob3") => DecisionOutput {decision_status: DecisionStatus::Fail, onboarding_id: ob_id("ob3"), create_manual_review: true})]
// // passing status and hit no rules -> pass
#[test_case(true, false, false, DecisionStatus::Pass, ob_id("ob4") => DecisionOutput {decision_status: DecisionStatus::Pass, onboarding_id: ob_id("ob4"), create_manual_review: false})]
// don't use rule flags, but we still pass because the passing rules are permanent
#[test_case(false, false, true, DecisionStatus::Pass, ob_id("ob5") => DecisionOutput {decision_status: DecisionStatus::Pass, onboarding_id: ob_id("ob5"), create_manual_review: false})]
// don't use rule flags, and we still fail bc idology failed
#[test_case(false, true, true, DecisionStatus::Fail, ob_id("ob6") => DecisionOutput {decision_status: DecisionStatus::Fail, onboarding_id: ob_id("ob6"), create_manual_review: true})]
fn test_final_decision(
    should_use_conservative_rules: bool,
    base_rules_should_fail: bool,
    conservative_rules_should_fail: bool,
    idology_status: DecisionStatus,
    onboarding_id: OnboardingId,
) -> DecisionOutput {
    use crate::{
        decision::{
            features::{FeatureVector, IDologyFeatures},
            rule::onboarding_rules,
        },
        feature_flag::MockFeatureFlagClient,
    };
    use mockall::predicate::*;
    use newtypes::VerificationResultId;

    // Set up a feature vector
    let idology_features = IDologyFeatures {
        status: idology_status,
        create_manual_review: false,
        id_located: true,
        is_id_scan_required: false,
        id_number_for_scan_required: Some(3010453),
        reason_codes: vec![],
        footprint_reason_codes: idology_reason_codes(base_rules_should_fail, conservative_rules_should_fail),
        verification_result: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap(),
        watchlist_potential_hit: false,
        watchlist_max_score: None,
    };

    let feature_vector = FeatureVector {
        idology_features: Some(idology_features),
        ..Default::default()
    };

    let mut mock_ff_client = MockFeatureFlagClient::new();
    // this is a permanent rule so we never request this flag value
    mock_ff_client
        .expect_bool_flag_by_rule_set_name()
        .with(
            eq("EnableRuleSetForDecision"),
            eq(onboarding_rules::idology_base_rule_set().name),
        )
        .never();

    mock_ff_client
        .expect_bool_flag_by_rule_set_name()
        .with(
            eq("EnableRuleSetForDecision"),
            eq(onboarding_rules::idology_conservative_rule_set().name),
        )
        .times(1)
        .return_once(move |_, _| Ok(should_use_conservative_rules));
    mock_ff_client
        .expect_bool_flag_by_rule_set_name()
        .with(
            eq("EnableRuleSetForDecision"),
            eq(onboarding_rules::temp_watchlist().name),
        )
        .times(1)
        .return_once(move |_, _| Ok(should_use_conservative_rules));

    // function under test
    final_decision(&feature_vector, onboarding_id, &mock_ff_client).unwrap()
}

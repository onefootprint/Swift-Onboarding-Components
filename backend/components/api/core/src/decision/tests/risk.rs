use crate::decision::onboarding::FeatureVector;
use crate::decision::{
    features::idology_expectid::IDologyFeatures, features::kyc_features::KycFeatureVector,
    onboarding::OnboardingRulesDecisionOutput, rule::onboarding_rules, rule::RuleName,
};
use feature_flag::{BoolFlag, MockFeatureFlagClient};
use newtypes::{DecisionStatus, FootprintReasonCode, VerificationResultId};
use std::str::FromStr;
use test_case::test_case;

fn create_onboarding_rules_decision_output(
    expected_decision_status: DecisionStatus,
    expected_create_manual_review: bool,
    expected_should_commit: bool,
    expected_triggered_rules: Vec<RuleName>,
    should_use_conservative_rules: bool,
) -> OnboardingRulesDecisionOutput {
    let conservative = onboarding_rules::idology_conservative_rule_set()
        .rules
        .into_iter()
        .map(|r| r.name);

    let base = onboarding_rules::idology_base_rule_set()
        .rules
        .into_iter()
        .map(|r| r.name);

    let all_non_triggering_rules = if should_use_conservative_rules {
        base.chain(conservative)
            .filter(|r| !expected_triggered_rules.contains(r))
            .collect()
    } else {
        base.filter(|r| !expected_triggered_rules.contains(r)).collect()
    };

    OnboardingRulesDecisionOutput {
        decision_status: expected_decision_status,
        should_commit: expected_should_commit,
        create_manual_review: expected_create_manual_review,
        rules_triggered: expected_triggered_rules,
        rules_not_triggered: all_non_triggering_rules,
    }
}

// id located
#[test_case(true, vec![] => create_onboarding_rules_decision_output(DecisionStatus::Pass, false, true, vec![], true); "id located -> pass")]
#[test_case(false, vec![] => create_onboarding_rules_decision_output(DecisionStatus::Pass, false, true, vec![], false); "id located, conservative rules are off -> pass")]
#[test_case(false, vec![FootprintReasonCode::IdNotLocated] => create_onboarding_rules_decision_output(DecisionStatus::Fail, true, false, vec![RuleName::IdNotLocated], false); "id not located -> fail")]
// id located, but was a watchlist hit so we commit, but fail onboarding
#[test_case(false, vec![FootprintReasonCode::WatchlistHitOfac] => create_onboarding_rules_decision_output(DecisionStatus::Fail, true, true, vec![RuleName::WatchlistHit], false); "id located, watchlist hit -> fail but commit")]
// id located, but was a watchlist hit + other failure, so we don't commit and fail onboarding
#[test_case(false, vec![FootprintReasonCode::WatchlistHitNonSdn, FootprintReasonCode::SubjectDeceased] => create_onboarding_rules_decision_output(DecisionStatus::Fail, true, false, vec![RuleName::SubjectDeceased, RuleName::WatchlistHit], false); "id located, watchlist hit + other reason -> fail and don't commit")]
// id located but hit a conservative rule -> fail
#[test_case(true, vec![FootprintReasonCode::AddressLocatedIsHighRiskAddress] => create_onboarding_rules_decision_output(DecisionStatus::Fail, true, false, vec![RuleName::AddressLocatedIsHighRiskAddress], true); "id located but hit a conservative rule -> fail")]
// id located but hit a base rule -> fail
#[test_case(false, vec![FootprintReasonCode::SubjectDeceased]=> create_onboarding_rules_decision_output(DecisionStatus::Fail, true, false, vec![RuleName::SubjectDeceased], false); "id located but hit a base rule -> fail")]
// conservative rules feature flagged on
#[test_case(true, vec![FootprintReasonCode::SubjectDeceased, FootprintReasonCode::AddressLocatedIsHighRiskAddress]=> create_onboarding_rules_decision_output(DecisionStatus::Fail, true, false, vec![RuleName::SubjectDeceased, RuleName::AddressLocatedIsHighRiskAddress], true); "id located, but hit a base rule and conservative rule -> fail")]

fn test_evaluate_onboarding_rules(
    should_use_conservative_rules: bool,
    fp_reason_codes: Vec<FootprintReasonCode>,
) -> OnboardingRulesDecisionOutput {
    // Set up a feature vector
    let idology_features = IDologyFeatures {
        is_id_scan_required: false,
        id_number_for_scan_required: Some(3010453),
        footprint_reason_codes: fp_reason_codes,
        verification_result: VerificationResultId::from_str("a5971b52-1b44-4c3a-a83f-a96796f8774d").unwrap(),
    };

    let feature_vector = KycFeatureVector {
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

    // function under test
    feature_vector.evaluate(&mock_ff_client).unwrap()
}

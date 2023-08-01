use crate::decision::features::risk_signals::risk_signal_group_struct::Kyc;
use crate::decision::features::risk_signals::{RiskSignalGroupStruct, RiskSignalsForDecision};
use crate::decision::onboarding::rules::{KycRuleExecutionConfig, KycRuleGroup};
use crate::decision::onboarding::Decision;
use crate::decision::{onboarding::OnboardingRulesDecisionOutput, rule::rule_sets, rule::RuleName};
use newtypes::{DecisionStatus, FootprintReasonCode, VendorAPI, VerificationResultId};
use std::str::FromStr;
use test_case::test_case;

fn create_onboarding_rules_decision_output(
    expected_decision_status: DecisionStatus,
    expected_create_manual_review: bool,
    expected_should_commit: bool,
    expected_triggered_rules: Vec<RuleName>,
) -> OnboardingRulesDecisionOutput {
    let base = rule_sets::kyc::idology_rule_set()
        .rules
        .into_iter()
        .map(|r| r.name);

    let all_non_triggering_rules = base.filter(|r| !expected_triggered_rules.contains(r)).collect();

    OnboardingRulesDecisionOutput {
        decision: Decision {
            decision_status: expected_decision_status,
            should_commit: expected_should_commit,
            create_manual_review: expected_create_manual_review,
            vendor_api: newtypes::VendorAPI::IdologyExpectID,
        },
        rules_triggered: expected_triggered_rules,
        rules_not_triggered: all_non_triggering_rules,
    }
}

// id located
#[test_case(vec![FootprintReasonCode::DobMatches] => create_onboarding_rules_decision_output(DecisionStatus::Pass, false, true, vec![]); "id located -> pass")]
#[test_case(vec![FootprintReasonCode::IdNotLocated] => create_onboarding_rules_decision_output(DecisionStatus::Fail, false, false, vec![RuleName::IdNotLocated]); "id not located -> fail")]
// id located, but was a watchlist hit so we commit, but fail onboarding and raise a review since it's just WL
#[test_case(vec![FootprintReasonCode::WatchlistHitOfac] => create_onboarding_rules_decision_output(DecisionStatus::Fail, true, true, vec![RuleName::WatchlistHit]); "id located, watchlist hit -> fail but commit")]
// 2 reasons for failing, we don't raise a review in any case if there's a hard fail
#[test_case(vec![FootprintReasonCode::WatchlistHitNonSdn, FootprintReasonCode::SubjectDeceased] => create_onboarding_rules_decision_output(DecisionStatus::Fail, false, false, vec![RuleName::SubjectDeceased, RuleName::WatchlistHit]); "id located, watchlist hit + other reason -> fail and don't commit")]
#[test_case(vec![FootprintReasonCode::SubjectDeceased]=> create_onboarding_rules_decision_output(DecisionStatus::Fail, false, false, vec![RuleName::SubjectDeceased]); "id located but hit a base rule -> fail")]
#[test_case(vec![FootprintReasonCode::SubjectDeceased, FootprintReasonCode::AddressLocatedIsHighRiskAddress]=> create_onboarding_rules_decision_output(DecisionStatus::Fail, false, false, vec![RuleName::SubjectDeceased]); "id located, but hit a base rule and conservative rule -> fail")]
fn test_evaluate_onboarding_rules(
    fp_reason_codes: Vec<FootprintReasonCode>,
) -> OnboardingRulesDecisionOutput {
    let frcs = fp_reason_codes
        .into_iter()
        .map(|f| {
            (
                f,
                VendorAPI::IdologyExpectID,
                VerificationResultId::from_str("vres123").unwrap(),
            )
        })
        .collect();

    let rsg = RiskSignalsForDecision {
        kyc: RiskSignalGroupStruct {
            footprint_reason_codes: frcs,
            group: Kyc,
        },
        ..Default::default()
    };

    let rule_group = KycRuleGroup::default();

    // function under test
    rule_group
        .evaluate(rsg, KycRuleExecutionConfig { include_doc: false })
        .unwrap()
        .final_kyc_decision()
        .unwrap()
}

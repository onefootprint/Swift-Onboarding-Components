use db::models::onboarding_decision::OnboardingDecision;
use newtypes::{DecisionStatus, FootprintReasonCode, RuleAction, VendorAPI};

use crate::{
    decision::{
        onboarding::{
            Decision, FeatureSet, FeatureVector, KybOnboardingRulesDecisionOutput, OnboardingRulesDecision,
            OnboardingRulesDecisionOutput,
        },
        rule::{self, rule_set::RuleSet, rule_sets},
    },
    errors::ApiResult,
};

impl FeatureSet for KybFeatureVector {
    fn footprint_reason_codes(&self) -> Vec<FootprintReasonCode> {
        self.footprint_reason_codes.clone()
    }
    fn vendor_apis(&self) -> Vec<newtypes::VendorAPI> {
        vec![VendorAPI::MiddeskBusinessUpdateWebhook]
    }
}

#[derive(Clone, Debug)]
pub struct KybFeatureVector {
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub bo_obds: Vec<OnboardingDecision>,
}

impl KybFeatureVector {
    pub fn new(
        footprint_reason_codes: Vec<FootprintReasonCode>,
        bo_obds: Vec<OnboardingDecision>,
    ) -> KybFeatureVector {
        Self {
            footprint_reason_codes,
            bo_obds,
        }
    }
}

impl FeatureVector for KybFeatureVector {
    fn evaluate(&self) -> ApiResult<OnboardingRulesDecision> {
        let middesk_rules: Vec<RuleSet<KybFeatureVector>> = vec![
            rule_sets::kyb::middesk_base_rule_set(),
            rule_sets::kyb::bos_pass_kyc_rule_set(),
        ];

        let eval_result = rule::rules_engine::evaluate_onboarding_rules(middesk_rules, self);

        let (create_manual_review, decision_status) = match eval_result.triggered_action {
            Some(a) => match a {
                RuleAction::StepUp => (true, DecisionStatus::Fail),
                RuleAction::ManualReview => (true, DecisionStatus::Fail),
                RuleAction::Fail => (true, DecisionStatus::Fail),
                RuleAction::PassWithManualReview => (true, DecisionStatus::Pass),
            },
            None => (false, DecisionStatus::Pass),
        };

        let kyb_decision = OnboardingRulesDecisionOutput {
            decision: Decision {
                decision_status,
                should_commit: false, // never commit business data for now
                create_manual_review,
                vendor_apis: eval_result.vendor_apis,
            },
            rules_triggered: eval_result.rules_triggered,
            rules_not_triggered: eval_result.rules_not_triggered,
        };

        Ok(OnboardingRulesDecision::Kyb(
            KybOnboardingRulesDecisionOutput::new(kyb_decision),
        ))
    }
}

use db::models::onboarding_decision::OnboardingDecision;
use newtypes::{DecisionStatus, FootprintReasonCode, VendorAPI};

use crate::{
    decision::{
        onboarding::{
            Decision, FeatureSet, FeatureVector, KybOnboardingRulesDecisionOutput, OnboardingRulesDecision,
            OnboardingRulesDecisionOutput,
        },
        rule::{
            self,
            rule_set::{Action, RuleSet},
            rule_sets,
        },
    },
    errors::ApiResult,
};

impl FeatureSet for KybFeatureVector {
    fn footprint_reason_codes(&self) -> &Vec<FootprintReasonCode> {
        &self.footprint_reason_codes
    }
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::MiddeskBusinessUpdateWebhook
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

        let decision_status = match eval_result.triggered_action {
            Some(a) => match a {
                Action::StepUp => DecisionStatus::Fail,
                Action::ManualReview => DecisionStatus::Fail,
                Action::Fail => DecisionStatus::Fail,
            },
            None => DecisionStatus::Pass,
        };
        let create_manual_review = decision_status == DecisionStatus::Fail;

        let kyb_decision = OnboardingRulesDecisionOutput {
            decision: Decision {
                decision_status,
                should_commit: false, // never commit business data for now
                create_manual_review,
                vendor_api: eval_result.vendor_api,
            },
            rules_triggered: eval_result.rules_triggered,
            rules_not_triggered: eval_result.rules_not_triggered,
        };

        Ok(OnboardingRulesDecision::Kyb(
            KybOnboardingRulesDecisionOutput::new(kyb_decision),
        ))
    }
}

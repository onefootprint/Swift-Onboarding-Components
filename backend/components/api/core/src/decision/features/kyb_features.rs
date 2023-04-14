use db::models::onboarding_decision::OnboardingDecision;
use idv::middesk::response::webhook::MiddeskBusinessUpdateWebhookResponse;
use newtypes::{DecisionStatus, FootprintReasonCode, Vendor, VendorAPI, VerificationResultId};

use crate::{
    decision::{
        onboarding::{FeatureVector, OnboardingRulesDecisionOutput},
        rule::{self, kyb_rules, rule_set::EvaluateRuleSet},
    },
    errors::ApiResult,
};

use super::middesk;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MiddeskFeatures {
    pub verification_result_id: VerificationResultId,
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
}

impl MiddeskFeatures {
    pub fn new(
        result: MiddeskBusinessUpdateWebhookResponse,
        verification_result_id: VerificationResultId,
    ) -> Self {
        let footprint_reason_codes = middesk::reason_codes(&result);

        Self {
            verification_result_id,
            footprint_reason_codes,
        }
    }
}

#[derive(Clone, Debug)]
pub struct KybFeatureVector {
    pub middesk_features: MiddeskFeatures,
    pub bo_obds: Vec<OnboardingDecision>,
}

impl KybFeatureVector {
    pub fn new(
        middesk_business_response: MiddeskBusinessUpdateWebhookResponse,
        verification_result_id: VerificationResultId,
        bo_obds: Vec<OnboardingDecision>,
    ) -> KybFeatureVector {
        Self {
            middesk_features: MiddeskFeatures::new(middesk_business_response, verification_result_id),
            bo_obds,
        }
    }
}

impl FeatureVector for KybFeatureVector {
    fn evaluate(
        &self,
        _ff_client: &impl feature_flag::FeatureFlagClient,
    ) -> ApiResult<OnboardingRulesDecisionOutput> {
        let middesk_rules: Vec<Box<dyn EvaluateRuleSet<KybFeatureVector>>> = vec![
            Box::new(kyb_rules::middesk_base_rule_set()),
            Box::new(kyb_rules::bos_pass_kyc_rule_set()),
        ];

        let eval_result = rule::rules_engine::evaluate_onboarding_rules(middesk_rules, self);

        let decision_status = if eval_result.triggered {
            DecisionStatus::Fail
        } else {
            DecisionStatus::Pass
        };
        let create_manual_review = decision_status == DecisionStatus::Fail;

        let output = OnboardingRulesDecisionOutput {
            decision_status,
            should_commit: false, // never commit business data for now
            create_manual_review,
            rules_triggered: eval_result.rules_triggered,
            rules_not_triggered: eval_result.rules_not_triggered,
        };
        Ok(output)
    }

    fn verification_results(&self) -> Vec<newtypes::VerificationResultId> {
        vec![self.middesk_features.verification_result_id.clone()]
    }

    fn reason_codes(&self, visible_vendor_apis: Vec<VendorAPI>) -> Vec<(FootprintReasonCode, Vec<Vendor>)> {
        if visible_vendor_apis.contains(&VendorAPI::MiddeskBusinessUpdateWebhook) {
            self.middesk_features
                .footprint_reason_codes
                .iter()
                .map(|r| (r.clone(), vec![Vendor::Middesk]))
                .collect()
        } else {
            vec![]
        }
    }
}

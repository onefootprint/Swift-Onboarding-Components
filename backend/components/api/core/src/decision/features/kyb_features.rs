use db::models::onboarding_decision::OnboardingDecision;
use idv::middesk::response::business::BusinessResponse;
use newtypes::{DecisionStatus, FootprintReasonCode, Vendor, VendorAPI, VerificationResultId};

use crate::{
    decision::{
        onboarding::{
            Decision, DecisionReasonCodes, FeatureSet, FeatureVector, OnboardingRulesDecisionOutput,
        },
        rule::{
            self,
            rule_set::{Action, RuleSet},
            rule_sets,
        },
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
    pub fn new(business_response: &BusinessResponse, verification_result_id: &VerificationResultId) -> Self {
        let footprint_reason_codes = middesk::reason_codes(business_response);

        Self {
            verification_result_id: verification_result_id.clone(),
            footprint_reason_codes,
        }
    }
}

impl FeatureSet for KybFeatureVector {
    fn footprint_reason_codes(&self) -> &Vec<FootprintReasonCode> {
        &self.middesk_features.footprint_reason_codes
    }
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::MiddeskBusinessUpdateWebhook
    }
    fn verification_result_id(&self) -> &VerificationResultId {
        &self.middesk_features.verification_result_id
    }
}

#[derive(Clone, Debug)]
pub struct KybFeatureVector {
    pub middesk_features: MiddeskFeatures,
    pub bo_obds: Vec<OnboardingDecision>,
}

impl KybFeatureVector {
    pub fn new(
        middesk_business_response: &BusinessResponse,
        verification_result_id: &VerificationResultId,
        bo_obds: Vec<OnboardingDecision>,
    ) -> KybFeatureVector {
        Self {
            middesk_features: MiddeskFeatures::new(middesk_business_response, verification_result_id),
            bo_obds,
        }
    }
}

impl KybFeatureVector {
    fn reason_codes(&self) -> Vec<(FootprintReasonCode, Vec<Vendor>)> {
        self.middesk_features
            .footprint_reason_codes
            .iter()
            .map(|r| (r.clone(), vec![Vendor::Middesk]))
            .collect()
    }
}

impl FeatureVector for KybFeatureVector {
    fn evaluate(&self) -> ApiResult<(OnboardingRulesDecisionOutput, DecisionReasonCodes)> {
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

        let output = OnboardingRulesDecisionOutput {
            decision: Decision {
                decision_status,
                should_commit: false, // never commit business data for now
                create_manual_review,
            },
            rules_triggered: eval_result.rules_triggered,
            rules_not_triggered: eval_result.rules_not_triggered,
        };

        let reason_codes = self.reason_codes();
        Ok((output, reason_codes))
    }

    fn verification_results(&self) -> Vec<newtypes::VerificationResultId> {
        vec![self.middesk_features.verification_result_id.clone()]
    }
}

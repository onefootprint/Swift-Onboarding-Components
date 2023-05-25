use newtypes::{DecisionStatus, FootprintReasonCode, Vendor, VendorAPI, VerificationResultId};

use crate::errors::ApiResult;

use super::rule::RuleName;

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct OnboardingRulesDecisionOutput {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
}

pub trait FeatureVector {
    fn evaluate(&self) -> ApiResult<OnboardingRulesDecisionOutput>;
    fn verification_results(&self) -> Vec<VerificationResultId>;
    fn reason_codes(&self, visible_vendor_apis: Vec<VendorAPI>) -> Vec<(FootprintReasonCode, Vec<Vendor>)>;
}

use newtypes::{DecisionStatus, FootprintReasonCode, Vendor, VendorAPI, VerificationResultId};

use crate::errors::ApiResult;

use super::rule::RuleName;

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct OnboardingRulesDecisionOutput {
    pub decision: Decision,
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
}

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct Decision {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
}

pub type DecisionReasonCodes = Vec<(FootprintReasonCode, Vec<Vendor>)>;
pub trait FeatureVector {
    fn evaluate(&self) -> ApiResult<(OnboardingRulesDecisionOutput, DecisionReasonCodes)>;
    fn verification_results(&self) -> Vec<VerificationResultId>;
}

pub trait FeatureSet {
    fn footprint_reason_codes(&self) -> &Vec<FootprintReasonCode>;
    fn vendor_api(&self) -> VendorAPI;
    fn verification_result_id(&self) -> &VerificationResultId;
}

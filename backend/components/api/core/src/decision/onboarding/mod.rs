use derive_more::Deref;
use newtypes::{DecisionStatus, FootprintReasonCode, VendorAPI, VerificationResultId};

use crate::errors::ApiResult;

use super::rule::RuleName;
pub mod rules;

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct OnboardingRulesDecisionOutput {
    pub decision: Decision,
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
}

#[derive(PartialEq, Eq, Debug, Clone, Deref)]
pub struct WaterfallOnboardingRulesDecisionOutput {
    #[deref]
    pub output: OnboardingRulesDecisionOutput,
    pub additional_evaluated: Vec<OnboardingRulesDecisionOutput>,
}

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct Decision {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
    pub vendor_api: VendorAPI,
}

pub type DecisionReasonCodes = Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)>;
pub trait FeatureVector {
    fn evaluate(&self) -> ApiResult<(WaterfallOnboardingRulesDecisionOutput, DecisionReasonCodes)>;
}

pub trait FeatureSet {
    fn footprint_reason_codes(&self) -> &Vec<FootprintReasonCode>;
    fn vendor_api(&self) -> VendorAPI;
}

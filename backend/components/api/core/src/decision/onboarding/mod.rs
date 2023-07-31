use enum_dispatch::enum_dispatch;
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

#[derive(PartialEq, Eq, Debug, Clone)]
pub enum DecisionResult {
    /// an evaluated decision
    Evaluated(OnboardingRulesDecisionOutput),
    /// if only doc or kyc is required
    NotRequired,
}

#[derive(PartialEq, Eq, Debug, Clone)]
#[enum_dispatch(FinalAndAdditionalDecisions)]
pub enum OnboardingRulesDecision {
    Kyc(WaterfallOnboardingRulesDecisionOutput),
    Kyb(KybOnboardingRulesDecisionOutput),
}

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct WaterfallOnboardingRulesDecisionOutput {
    kyc_decision: DecisionResult,
    doc_decision: DecisionResult,
    additional_kyc_evaluated: Vec<OnboardingRulesDecisionOutput>,
}

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct KybOnboardingRulesDecisionOutput {
    kyb_decision_output: OnboardingRulesDecisionOutput,
}

#[enum_dispatch]
pub trait FinalAndAdditionalDecisions {
    fn final_decision_and_additional_evaluated(
        &self,
    ) -> ApiResult<(OnboardingRulesDecisionOutput, Vec<OnboardingRulesDecisionOutput>)>;
}

impl WaterfallOnboardingRulesDecisionOutput {
    pub fn new(
        kyc_decision: DecisionResult,
        doc_decision: DecisionResult,
        additional_kyc_evaluated: Vec<OnboardingRulesDecisionOutput>,
    ) -> Self {
        Self {
            kyc_decision,
            doc_decision,
            additional_kyc_evaluated,
        }
    }

    pub fn final_kyc_decision(&self) -> ApiResult<OnboardingRulesDecisionOutput> {
        let result = self
            .kyc_decisions()
            .iter()
            .filter_map(|d| match d {
                DecisionResult::Evaluated(e) => Some(e),
                DecisionResult::NotRequired => None,
            })
            .min_by(|x, y| x.decision.decision_status.cmp(&y.decision.decision_status))
            .ok_or(crate::decision::Error::DecisionNotFound)?
            .clone();

        Ok(result)
    }

    fn kyc_decisions(&self) -> Vec<DecisionResult> {
        vec![self.kyc_decision.clone(), self.doc_decision.clone()]
    }

    pub fn vendors_for_unhiding_risk_signals(&self) -> Vec<VendorAPI> {
        self.kyc_decisions()
            .iter()
            .filter_map(|d| match d {
                DecisionResult::Evaluated(e) => Some(e.decision.vendor_api),
                DecisionResult::NotRequired => None,
            })
            .collect()
    }
}

impl FinalAndAdditionalDecisions for WaterfallOnboardingRulesDecisionOutput {
    fn final_decision_and_additional_evaluated(
        &self,
    ) -> ApiResult<(OnboardingRulesDecisionOutput, Vec<OnboardingRulesDecisionOutput>)> {
        let final_decision = self.final_kyc_decision()?;
        let additional = match (self.kyc_decision.clone(), self.doc_decision.clone()) {
            // we only choose 1 to be the "final decision" (for simplicity, for now), so append the other one to our additional eval list
            (DecisionResult::Evaluated(r_kyc), DecisionResult::Evaluated(r_doc)) => {
                if r_kyc == final_decision {
                    vec![r_doc]
                } else {
                    vec![r_kyc]
                }
            }
            // if only 1 is present, it will already be populated in `final_decision`
            _ => vec![],
        }
        .into_iter()
        .chain(self.additional_kyc_evaluated.clone().into_iter())
        .collect();

        Ok((final_decision, additional))
    }
}

impl KybOnboardingRulesDecisionOutput {
    pub fn new(kyb_decision_output: OnboardingRulesDecisionOutput) -> Self {
        Self { kyb_decision_output }
    }
}

impl FinalAndAdditionalDecisions for KybOnboardingRulesDecisionOutput {
    fn final_decision_and_additional_evaluated(
        &self,
    ) -> ApiResult<(OnboardingRulesDecisionOutput, Vec<OnboardingRulesDecisionOutput>)> {
        let final_decision = self.kyb_decision_output.clone();

        Ok((final_decision, vec![]))
    }
}

// handle ONLY doc or ONLY kyc

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct Decision {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
    pub vendor_api: VendorAPI,
}

pub type DecisionReasonCodes = Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)>;
pub trait FeatureVector {
    fn evaluate(&self) -> ApiResult<(OnboardingRulesDecision, DecisionReasonCodes)>;
}

pub trait FeatureSet {
    fn footprint_reason_codes(&self) -> &Vec<FootprintReasonCode>;
    fn vendor_api(&self) -> VendorAPI;
}

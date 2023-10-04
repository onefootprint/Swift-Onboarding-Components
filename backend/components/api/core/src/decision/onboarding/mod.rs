use enum_dispatch::enum_dispatch;
use newtypes::{DecisionStatus, FootprintReasonCode, VendorAPI};

use crate::errors::ApiResult;

use super::rule::RuleName;
pub mod rules;

#[derive(Eq, Debug, Clone)]
pub struct OnboardingRulesDecisionOutput {
    pub decision: Decision,
    pub rules_triggered: Vec<RuleName>,
    pub rules_not_triggered: Vec<RuleName>,
}

impl PartialEq for OnboardingRulesDecisionOutput {
    fn eq(&self, other: &Self) -> bool {
        self.decision == other.decision && self.rules_triggered == other.rules_triggered
    }
}

impl OnboardingRulesDecisionOutput {
    pub fn update_should_commit(&mut self, should_commit: bool) {
        self.decision.should_commit = should_commit;
    }
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
    pub kyc_decision: DecisionResult,
    pub doc_decision: DecisionResult,
    pub aml_decision: DecisionResult,
}

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct KybOnboardingRulesDecisionOutput {
    kyb_decision_output: OnboardingRulesDecisionOutput,
}

#[enum_dispatch]
pub trait FinalAndAdditionalDecisions {
    fn final_decision_and_additional_evaluated(&self) -> ApiResult<OnboardingRulesDecisionOutput>;
}

impl WaterfallOnboardingRulesDecisionOutput {
    pub fn new(
        kyc_decision: DecisionResult,
        doc_decision: DecisionResult,
        aml_decision: DecisionResult,
    ) -> Self {
        Self {
            kyc_decision,
            doc_decision,
            aml_decision,
        }
    }

    pub fn final_kyc_decision(&self) -> ApiResult<OnboardingRulesDecisionOutput> {
        let mut result = self
            .kyc_and_doc_decisions()
            .iter()
            .filter_map(|d| match d {
                DecisionResult::Evaluated(e) => Some(e),
                DecisionResult::NotRequired => None,
            })
            .min_by(|x, y| x.decision.decision_status.cmp(&y.decision.decision_status))
            .ok_or(crate::decision::Error::DecisionNotFound)?
            .clone();
        // Kinda hacky, but we want the status to come from Doc OR KYC, but the committing decision to just come from KYC
        result.update_should_commit(self.should_commit());

        Ok(result)
    }

    pub fn should_commit(&self) -> bool {
        match &self.kyc_decision {
            DecisionResult::Evaluated(d) => d.decision.should_commit,
            DecisionResult::NotRequired => false,
        }
    }

    fn kyc_and_doc_decisions(&self) -> Vec<DecisionResult> {
        vec![
            self.kyc_decision.clone(),
            self.aml_decision.clone(),
            self.doc_decision.clone(),
        ]
    }
}

impl FinalAndAdditionalDecisions for WaterfallOnboardingRulesDecisionOutput {
    fn final_decision_and_additional_evaluated(&self) -> ApiResult<OnboardingRulesDecisionOutput> {
        let final_decision = self.final_kyc_decision()?;

        Ok(final_decision)
    }
}

impl KybOnboardingRulesDecisionOutput {
    pub fn new(kyb_decision_output: OnboardingRulesDecisionOutput) -> Self {
        Self { kyb_decision_output }
    }
}

impl FinalAndAdditionalDecisions for KybOnboardingRulesDecisionOutput {
    fn final_decision_and_additional_evaluated(&self) -> ApiResult<OnboardingRulesDecisionOutput> {
        let final_decision = self.kyb_decision_output.clone();

        Ok(final_decision)
    }
}

// handle ONLY doc or ONLY kyc

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct Decision {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
    pub vendor_apis: Vec<VendorAPI>,
}
pub trait FeatureVector {
    fn evaluate(&self) -> ApiResult<OnboardingRulesDecision>;
}

pub trait FeatureSet {
    fn footprint_reason_codes(&self) -> Vec<FootprintReasonCode>;
    fn vendor_apis(&self) -> Vec<VendorAPI>;
}

use std::cmp::Ordering;

use enum_dispatch::enum_dispatch;
use newtypes::{DecisionStatus, FootprintReasonCode, RuleAction, RuleName, VendorAPI};
use serde::Serialize;

use crate::errors::ApiResult;


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
            .min_by(|x, y| x.decision.cmp(&y.decision))
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

#[derive(PartialEq, Eq, Debug, Clone, Serialize)]
pub struct Decision {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
    pub action: Option<RuleAction>,
}

pub trait FeatureVector {
    fn evaluate(&self) -> ApiResult<OnboardingRulesDecision>;
}

pub trait FeatureSet {
    fn footprint_reason_codes(&self) -> Vec<FootprintReasonCode>;
    fn vendor_apis(&self) -> Vec<VendorAPI>;
}

// Note: follows the same convention as DecisionStatus, which has more egregious things as Ordering::Less
// This is tested
impl Ord for Decision {
    fn cmp(&self, other: &Self) -> Ordering {
        let ord = self.decision_status.cmp(&other.decision_status);

        // tie breaker is manual review
        match ord {
            Ordering::Equal => {
                // we have special logic for failure
                let decision_is_fail = self.decision_status == DecisionStatus::Fail;

                match (self.create_manual_review, other.create_manual_review) {
                    (true, true) => Ordering::Equal,
                    (true, false) => {
                        if decision_is_fail {
                            Ordering::Greater
                        } else {
                            Ordering::Less
                        }
                    }
                    (false, true) => {
                        if decision_is_fail {
                            Ordering::Less
                        } else {
                            Ordering::Greater
                        }
                    }
                    (false, false) => Ordering::Equal,
                }
            }
            _ => ord,
        }
    }
}

impl PartialOrd for Decision {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use super::Decision;
    use newtypes::DecisionStatus;
    use std::cmp::Ordering;

    // LESS is the one that we'll choose
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::Fail, false) => Ordering::Greater; "both fail, one without review is greater")]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::Fail, true) => Ordering::Less; "both fail, one without review is less")]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::Fail, false) => Ordering::Equal; "both fail, both no review")]
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::Fail, true) => Ordering::Equal; "both fail, both review")]
    // Pass
    #[test_case((DecisionStatus::Pass, true), (DecisionStatus::Pass, false) => Ordering::Less; "both pass, one without review is less")]
    #[test_case((DecisionStatus::Pass, false), (DecisionStatus::Pass, true) => Ordering::Greater; "both pass, one without review is greater")]
    #[test_case((DecisionStatus::Pass, false), (DecisionStatus::Pass, false) => Ordering::Equal; "both pass, both no review")]
    #[test_case((DecisionStatus::Pass, true), (DecisionStatus::Pass, true) => Ordering::Equal; "both pass, both review")]
    // Step up
    #[test_case((DecisionStatus::StepUp, true), (DecisionStatus::StepUp, false) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, false), (DecisionStatus::StepUp, true) => Ordering::Greater)]
    #[test_case((DecisionStatus::StepUp, false), (DecisionStatus::StepUp, false) => Ordering::Equal)]
    #[test_case((DecisionStatus::StepUp, true), (DecisionStatus::StepUp, true) => Ordering::Equal)]
    // Ordered based on decision
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::Pass, false) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::Pass, true) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::Pass, false) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::Pass, true) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::StepUp, false) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::StepUp, true) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, false), (DecisionStatus::StepUp, false) => Ordering::Less)]
    #[test_case((DecisionStatus::Fail, true), (DecisionStatus::StepUp, true) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, true), (DecisionStatus::Pass, false) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, false), (DecisionStatus::Pass, true) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, false), (DecisionStatus::Pass, false) => Ordering::Less)]
    #[test_case((DecisionStatus::StepUp, true), (DecisionStatus::Pass, true) => Ordering::Less)]

    fn test_ord_decision(d_args_1: (DecisionStatus, bool), d_args_2: (DecisionStatus, bool)) -> Ordering {
        let decision1 = Decision {
            decision_status: d_args_1.0,
            should_commit: false,
            create_manual_review: d_args_1.1,
            action: None,
        };

        let decision2 = Decision {
            decision_status: d_args_2.0,
            should_commit: false,
            create_manual_review: d_args_2.1,
            action: None,
        };

        decision1.cmp(&decision2)
    }
}

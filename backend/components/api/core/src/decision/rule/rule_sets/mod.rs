use newtypes::{FootprintReasonCode, VendorAPI};

use crate::decision::{features::risk_signals::RiskSignalsForDecision, onboarding::FeatureSet};

use super::{
    rule_set::Rule,
    rules_engine::{evaluate_reason_code_rules, OnboardingEvaluationResult},
};

pub mod alpaca;
pub mod common;
pub mod doc;
pub mod kyb;
pub mod kyc;

#[allow(dead_code)]
pub struct RiskSignalRuleOutput {
    pub kyc: Option<OnboardingEvaluationResult>,
    pub doc: Option<OnboardingEvaluationResult>,
    pub aml: Option<OnboardingEvaluationResult>,
}

pub struct RiskSignalRuleEvaluator {
    kyc_rules: Vec<Rule<Vec<FootprintReasonCode>>>,
    doc_rules: Vec<Rule<Vec<FootprintReasonCode>>>,
    aml_rules: Vec<Rule<Vec<FootprintReasonCode>>>,
}
impl RiskSignalRuleEvaluator {
    pub fn new(
        kyc_rules: Vec<Rule<Vec<FootprintReasonCode>>>,
        doc_rules: Vec<Rule<Vec<FootprintReasonCode>>>,
        aml_rules: Vec<Rule<Vec<FootprintReasonCode>>>,
    ) -> Self {
        Self {
            kyc_rules,
            doc_rules,
            aml_rules,
        }
    }
}

impl RiskSignalRuleEvaluator {
    pub fn evaluate(
        &self,
        risk_signals_for_decision: RiskSignalsForDecision,
        allow_stepup: bool,
    ) -> RiskSignalRuleOutput {
        let kyc = risk_signals_for_decision.kyc.as_ref().map(|rsg| {
            Self::evaluate_rsg_rules(
                self.kyc_rules.clone(),
                &rsg.footprint_reason_codes(),
                rsg.vendor_apis(),
                allow_stepup,
            )
        });

        let doc = risk_signals_for_decision.doc.as_ref().map(|rsg| {
            Self::evaluate_rsg_rules(
                self.doc_rules.clone(),
                &rsg.footprint_reason_codes(),
                rsg.vendor_apis(),
                allow_stepup,
            )
        });

        let aml = risk_signals_for_decision.aml.as_ref().map(|rsg| {
            Self::evaluate_rsg_rules(
                self.aml_rules.clone(),
                &rsg.footprint_reason_codes(),
                rsg.vendor_apis(),
                allow_stepup,
            )
        });

        RiskSignalRuleOutput { kyc, doc, aml }
    }

    fn evaluate_rsg_rules(
        rules: Vec<Rule<Vec<FootprintReasonCode>>>,
        footprint_reason_codes: &Vec<FootprintReasonCode>,
        vendor_apis: Vec<VendorAPI>,
        allow_stepup: bool,
    ) -> OnboardingEvaluationResult {
        evaluate_reason_code_rules(rules, footprint_reason_codes, vendor_apis, allow_stepup)
    }
}

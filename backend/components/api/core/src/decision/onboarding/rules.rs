use newtypes::{DecisionStatus, VendorAPI};

use crate::errors::ApiResult;
use crate::{decision::Error, ApiError};

use crate::decision::{
    features::{
        experian::ExperianFeatures,
        idology_expectid::IDologyFeatures,
        incode_docv::IncodeDocumentFeatures,
        kyc_features::KycFeatureVector,
        risk_signals::{RiskSignalGroupStruct, RiskSignalsForDecision, WrappedRiskSignalGroupKind},
    },
    rule::{
        self,
        rule_set::{Action, RuleSet},
        rule_sets,
        rules_engine::{evaluate_onboarding_rule_set, OnboardingEvaluationResult},
    },
    RuleError,
};

use super::{
    Decision, DecisionReasonCodes, FeatureSet, OnboardingRulesDecisionOutput,
    WaterfallOnboardingRulesDecisionOutput,
};

// Convert a typed group of risk signals into a Vendor specific FeatureSet
pub fn rule_input_from_risk_signals<T, F>(risk_signals: RiskSignalGroupStruct<T>) -> ApiResult<F>
where
    F: TryFrom<RiskSignalGroupStruct<T>>,
    F: Clone + FeatureSet,
    ApiError: std::convert::From<<F as std::convert::TryFrom<RiskSignalGroupStruct<T>>>::Error>,
    T: Into<WrappedRiskSignalGroupKind> + Clone,
{
    let res = F::try_from(risk_signals)?;

    Ok(res)
}

pub fn evaluate_rule_set_from_risk_signals<T, F>(
    rule_set: RuleSet<F>,
    risk_signals: RiskSignalGroupStruct<T>,
) -> ApiResult<OnboardingEvaluationResult>
where
    F: TryFrom<RiskSignalGroupStruct<T>>,
    F: Clone + FeatureSet,
    ApiError: std::convert::From<<F as std::convert::TryFrom<RiskSignalGroupStruct<T>>>::Error>,
    T: Into<WrappedRiskSignalGroupKind> + Clone,
{
    let input: F = rule_input_from_risk_signals(risk_signals)?;
    Ok(evaluate_onboarding_rule_set(rule_set, &input))
}

// A rule group encodes a logic grouping of rulesets for a specific purpose.
pub enum RuleGroup {
    Kyc(KycRuleGroup),
    KycWithDocument(KycWithDocumentRuleGroup),
}

impl RuleGroup {
    pub fn evaluate(
        &self,
        risk_signals: RiskSignalsForDecision,
    ) -> ApiResult<WaterfallOnboardingRulesDecisionOutput> {
        match self {
            RuleGroup::Kyc(rg) => rg.evaluate(risk_signals),
            RuleGroup::KycWithDocument(rg) => rg.evaluate(risk_signals),
        }
    }
}

pub struct KycRuleGroup {
    pub idology_rules: RuleSet<IDologyFeatures>,
    pub experian_rules: RuleSet<ExperianFeatures>,
}

impl Default for KycRuleGroup {
    fn default() -> Self {
        Self {
            idology_rules: rule_sets::kyc::idology_rule_set(),
            experian_rules: rule_sets::kyc::experian_rule_set(),
        }
    }
}
impl KycRuleGroup {
    fn evaluate(
        &self,
        risk_signals: RiskSignalsForDecision,
    ) -> ApiResult<WaterfallOnboardingRulesDecisionOutput> {
        // Since we waterfall here, we don't expect all the rule results to be available. But we do expect that at least _1_ is available
        let idology_rule_result =
            evaluate_rule_set_from_risk_signals(self.idology_rules.clone(), risk_signals.kyc.clone()).ok();
        let experian_rule_result =
            evaluate_rule_set_from_risk_signals(self.experian_rules.clone(), risk_signals.kyc).ok();

        let rule_results: Vec<OnboardingEvaluationResult> = vec![experian_rule_result, idology_rule_result]
            .into_iter()
            .flatten()
            .collect();
        if rule_results.is_empty() {
            Err(crate::decision::Error::from(RuleError::MissingInputForRules))?;
        }

        let result = rule_results
            .iter()
            .min_by(|x, y| x.triggered_action.cmp(&y.triggered_action))
            .ok_or(RuleError::AssertionError("could not compute waterfall".into()))
            .map_err(crate::decision::Error::from)?
            .clone();
        let additional_results = rule_results
            .into_iter()
            .filter(|ober| ober != &result)
            .map(OnboardingRulesDecisionOutput::from)
            .collect();

        let output = WaterfallOnboardingRulesDecisionOutput {
            output: OnboardingRulesDecisionOutput::from(result),
            additional_evaluated: additional_results,
        };

        Ok(output)
    }
}

pub struct KycWithDocumentRuleGroup {
    pub idology_rules: RuleSet<IDologyFeatures>,
    pub experian_rules: RuleSet<ExperianFeatures>,
    pub incode_doc_rules: RuleSet<IncodeDocumentFeatures>,
}

impl KycWithDocumentRuleGroup {
    fn evaluate(
        &self,
        risk_signals: RiskSignalsForDecision,
    ) -> ApiResult<WaterfallOnboardingRulesDecisionOutput> {
        // Since we waterfall here, we don't expect all the rule results to be available. But we do expect that at least _1_ is available
        let idology_rule_result =
            evaluate_rule_set_from_risk_signals(self.idology_rules.clone(), risk_signals.kyc.clone()).ok();
        let experian_rule_result =
            evaluate_rule_set_from_risk_signals(self.experian_rules.clone(), risk_signals.kyc).ok();
        let incode_doc_rule_result =
            evaluate_rule_set_from_risk_signals(self.incode_doc_rules.clone(), risk_signals.doc)?; // error since we know we need doc signals

        // Check we have a KYC result from one of the vendors
        let kyc_rule_results: Vec<OnboardingEvaluationResult> =
            vec![experian_rule_result, idology_rule_result]
                .into_iter()
                .flatten()
                .collect();

        if kyc_rule_results.is_empty() {
            Err(crate::decision::Error::from(RuleError::MissingInputForRules))?;
        }

        // First we evaluate KYC, choosing which of the potentially multiple vendors we might have
        let kyc_result = kyc_rule_results
            .iter()
            .min_by(|x, y| x.triggered_action.cmp(&y.triggered_action))
            .ok_or(RuleError::AssertionError("could not compute waterfall".into()))
            .map_err(crate::decision::Error::from)?
            .clone();

        // Then we evaluate w/ doc, but now we look for which one failed
        let result = vec![kyc_result, incode_doc_rule_result.clone()]
            .iter()
            .max_by(|x, y| x.triggered_action.cmp(&y.triggered_action))
            .ok_or(RuleError::AssertionError("could not compute doc result".into()))
            .map_err(crate::decision::Error::from)?
            .clone();

        let mut additional_results: Vec<OnboardingRulesDecisionOutput> = kyc_rule_results
            .into_iter()
            .filter(|ober| ober != &result)
            .map(OnboardingRulesDecisionOutput::from)
            .collect();

        // Add in doc to additional log if it's not causing the failure
        if !result.vendor_api.is_incode_doc_flow_api() {
            additional_results.push(OnboardingRulesDecisionOutput::from(incode_doc_rule_result));
        }

        let output = WaterfallOnboardingRulesDecisionOutput {
            output: OnboardingRulesDecisionOutput::from(result),
            additional_evaluated: additional_results,
        };

        Ok(output)
    }
}

// Calculate the outputs of rules
pub fn calculate_kyc_rules_output_with_waterfall(
    feature_vector: &KycFeatureVector,
    rule_group: KycRuleGroup,
) -> ApiResult<(WaterfallOnboardingRulesDecisionOutput, DecisionReasonCodes)> {
    // Evaluate rules
    let idology_rule_result = feature_vector
        .idology_features
        .as_ref()
        .map(|f| rule::rules_engine::evaluate_onboarding_rule_set(rule_group.idology_rules, f));

    let experian_result = feature_vector
        .experian_features
        .as_ref()
        .map(|e| rule::rules_engine::evaluate_onboarding_rule_set(rule_group.experian_rules, e));

    // TODO: add Ord so we have a vendor preference
    let rule_results: Vec<OnboardingEvaluationResult> = vec![experian_result, idology_rule_result]
        .into_iter()
        .flatten()
        .collect();
    if rule_results.is_empty() {
        Err(crate::decision::Error::from(RuleError::MissingInputForRules))?;
    }

    let result = rule_results
        .iter()
        .min_by(|x, y| x.triggered_action.cmp(&y.triggered_action))
        .ok_or(RuleError::AssertionError("could not compute waterfall".into()))
        .map_err(Error::from)?
        .clone();
    let additional_results = rule_results
        .into_iter()
        .filter(|ober| ober != &result)
        .map(OnboardingRulesDecisionOutput::from)
        .collect();

    // TODO: derive this better
    let reason_codes = feature_vector.reason_codes(vec![VendorAPI::TwilioLookupV2, result.vendor_api]);

    let output = WaterfallOnboardingRulesDecisionOutput {
        output: OnboardingRulesDecisionOutput::from(result),
        additional_evaluated: additional_results,
    };

    Ok((output, reason_codes))
}

impl From<&Action> for DecisionStatus {
    fn from(value: &Action) -> Self {
        match value {
            Action::StepUp => DecisionStatus::StepUp,
            Action::ManualReview => DecisionStatus::Fail,
            Action::Fail => DecisionStatus::Fail,
        }
    }
}

impl From<OnboardingEvaluationResult> for OnboardingRulesDecisionOutput {
    fn from(result: OnboardingEvaluationResult) -> Self {
        // If we no rules that triggered, we consider that a pass
        let (decision_status, create_manual_review) = match result.triggered_action.as_ref() {
            Some(a) => (a.into(), a == &Action::ManualReview),
            None => (DecisionStatus::Pass, false),
        };

        OnboardingRulesDecisionOutput {
            decision: Decision {
                should_commit: KycFeatureVector::should_commit(&result.rules_triggered),
                decision_status,
                create_manual_review,
                vendor_api: result.vendor_api,
            },
            rules_triggered: result.rules_triggered.to_owned(),
            rules_not_triggered: result.rules_not_triggered.to_owned(),
        }
    }
}

impl From<OnboardingRulesDecisionOutput> for WaterfallOnboardingRulesDecisionOutput {
    fn from(value: OnboardingRulesDecisionOutput) -> Self {
        Self {
            output: value,
            additional_evaluated: vec![],
        }
    }
}

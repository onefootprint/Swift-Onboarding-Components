use derive_more::Deref;
use newtypes::{DecisionStatus, FootprintReasonCode, VendorAPI, VerificationResultId};

use crate::errors::ApiResult;
use crate::{decision::Error, ApiError};

use super::features::risk_signals::{
    RiskSignalGroupStruct, RiskSignalsForDecision, WrappedRiskSignalGroupKind,
};
use super::vendor::vendor_api::vendor_api_response::VendorAPIResponseIdentifiersMap;
use super::{
    features::{
        experian::ExperianFeatures, idology_expectid::IDologyFeatures, kyc_features::KycFeatureVector,
    },
    rule::{
        self,
        rule_set::{Action, RuleSet},
        rule_sets,
        rules_engine::{evaluate_onboarding_rule_set, OnboardingEvaluationResult},
        RuleName,
    },
    vendor::vendor_api::vendor_api_response::VendorAPIResponseMap,
    RuleError,
};

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
    fn verification_result_id(&self) -> &VerificationResultId;
}

/// Derive rule inputs
pub fn rule_input_from_vendor_results<'a, T>(
    vendor_response_map: &'a VendorAPIResponseMap,
    vendor_ids_map: &'a VendorAPIResponseIdentifiersMap,
) -> ApiResult<T>
where
    T: TryFrom<(&'a VendorAPIResponseMap, &'a VendorAPIResponseIdentifiersMap)>,
    T: Clone + FeatureSet,
    ApiError: std::convert::From<
        <T as std::convert::TryFrom<(&'a VendorAPIResponseMap, &'a VendorAPIResponseIdentifiersMap)>>::Error,
    >,
{
    let res = T::try_from((vendor_response_map, vendor_ids_map))?;

    Ok(res)
}

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
) -> ApiResult<(OnboardingEvaluationResult, DecisionReasonCodes)>
where
    F: TryFrom<RiskSignalGroupStruct<T>>,
    F: Clone + FeatureSet,
    ApiError: std::convert::From<<F as std::convert::TryFrom<RiskSignalGroupStruct<T>>>::Error>,
    T: Into<WrappedRiskSignalGroupKind> + Clone,
{
    let input: F = rule_input_from_risk_signals(risk_signals)?;
    let reason_codes = input.footprint_reason_codes().clone();
    Ok((
        evaluate_onboarding_rule_set(rule_set, &input),
        reason_codes
            .into_iter()
            .map(|rs| (rs, input.vendor_api(), input.verification_result_id().clone()))
            .collect(),
    ))
}

pub fn evaluate_rule_set_from_vendor_results<'a, T>(
    rule_set: RuleSet<T>,
    vendor_response_map: &'a VendorAPIResponseMap,
    vendor_ids_map: &'a VendorAPIResponseIdentifiersMap,
) -> ApiResult<(OnboardingEvaluationResult, DecisionReasonCodes)>
where
    T: TryFrom<(&'a VendorAPIResponseMap, &'a VendorAPIResponseIdentifiersMap)>,
    T: Clone + FeatureSet,
    ApiError: std::convert::From<
        <T as std::convert::TryFrom<(&'a VendorAPIResponseMap, &'a VendorAPIResponseIdentifiersMap)>>::Error,
    >,
{
    let input: T = rule_input_from_vendor_results(vendor_response_map, vendor_ids_map)?;
    let reason_codes = input.footprint_reason_codes().clone();
    Ok((
        evaluate_onboarding_rule_set(rule_set, &input),
        reason_codes
            .into_iter()
            .map(|rs| (rs, input.vendor_api(), input.verification_result_id().clone()))
            .collect(),
    ))
}

// A rule group encodes a logic grouping of rulesets for a specific purpose.
pub enum RuleGroup {
    Kyc(KycRuleGroup),
}

impl RuleGroup {
    pub fn evaluate(
        &self,
        vendor_response_map: &VendorAPIResponseMap,
        vendor_ids_map: &VendorAPIResponseIdentifiersMap,
    ) -> ApiResult<(WaterfallOnboardingRulesDecisionOutput, DecisionReasonCodes)> {
        match self {
            RuleGroup::Kyc(rg) => rg.evaluate_kyc_rules_with_waterfall(vendor_response_map, vendor_ids_map),
        }
    }

    pub fn evaluate_with_risk_signals(
        &self,
        risk_signals: RiskSignalsForDecision,
    ) -> ApiResult<(WaterfallOnboardingRulesDecisionOutput, DecisionReasonCodes)> {
        match self {
            RuleGroup::Kyc(rg) => rg.evaluate_kyc_rules_with_risk_signals(risk_signals),
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
    // TODO: deprecate
    pub fn evaluate_kyc_rules_with_waterfall(
        &self,
        vendor_response_map: &VendorAPIResponseMap,
        vendor_ids_map: &VendorAPIResponseIdentifiersMap,
    ) -> ApiResult<(WaterfallOnboardingRulesDecisionOutput, DecisionReasonCodes)> {
        // Since we waterfall here, we don't expect all the rule results to be available. But we do expect that at least _1_ is available
        let idology_rule_result = evaluate_rule_set_from_vendor_results(
            self.idology_rules.clone(),
            vendor_response_map,
            vendor_ids_map,
        )
        .ok();
        let experian_rule_result = evaluate_rule_set_from_vendor_results(
            self.experian_rules.clone(),
            vendor_response_map,
            vendor_ids_map,
        )
        .ok();

        let rule_results: Vec<(OnboardingEvaluationResult, DecisionReasonCodes)> =
            vec![experian_rule_result, idology_rule_result]
                .into_iter()
                .flatten()
                .collect();
        if rule_results.is_empty() {
            Err(crate::decision::Error::from(RuleError::MissingInputForRules))?;
        }

        let (result, reason_codes) = rule_results
            .iter()
            .min_by(|x, y| x.0.triggered_action.cmp(&y.0.triggered_action))
            .ok_or(RuleError::AssertionError("could not compute waterfall".into()))
            .map_err(crate::decision::Error::from)?
            .clone();
        let additional_results = rule_results
            .into_iter()
            .filter(|(ober, _)| ober != &result)
            .map(|(ober, _)| OnboardingRulesDecisionOutput::from(ober))
            .collect();

        let output = WaterfallOnboardingRulesDecisionOutput {
            output: OnboardingRulesDecisionOutput::from(result),
            additional_evaluated: additional_results,
        };

        Ok((output, reason_codes))
    }

    fn evaluate_kyc_rules_with_risk_signals(
        &self,
        risk_signals: RiskSignalsForDecision,
    ) -> ApiResult<(WaterfallOnboardingRulesDecisionOutput, DecisionReasonCodes)> {
        // Since we waterfall here, we don't expect all the rule results to be available. But we do expect that at least _1_ is available
        let idology_rule_result =
            evaluate_rule_set_from_risk_signals(self.idology_rules.clone(), risk_signals.kyc.clone()).ok();
        let experian_rule_result =
            evaluate_rule_set_from_risk_signals(self.experian_rules.clone(), risk_signals.kyc).ok();

        let rule_results: Vec<(OnboardingEvaluationResult, DecisionReasonCodes)> =
            vec![experian_rule_result, idology_rule_result]
                .into_iter()
                .flatten()
                .collect();
        if rule_results.is_empty() {
            Err(crate::decision::Error::from(RuleError::MissingInputForRules))?;
        }

        let (result, reason_codes) = rule_results
            .iter()
            .min_by(|x, y| x.0.triggered_action.cmp(&y.0.triggered_action))
            .ok_or(RuleError::AssertionError("could not compute waterfall".into()))
            .map_err(crate::decision::Error::from)?
            .clone();
        let additional_results = rule_results
            .into_iter()
            .filter(|(ober, _)| ober != &result)
            .map(|(ober, _)| OnboardingRulesDecisionOutput::from(ober))
            .collect();

        let output = WaterfallOnboardingRulesDecisionOutput {
            output: OnboardingRulesDecisionOutput::from(result),
            additional_evaluated: additional_results,
        };

        Ok((output, reason_codes))
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

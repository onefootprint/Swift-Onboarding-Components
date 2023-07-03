use newtypes::{DecisionStatus, FootprintReasonCode, VendorAPI};

use crate::errors::ApiResult;
use crate::{decision::Error, ApiError};

use super::{
    features::{
        experian::ExperianFeatures, idology_expectid::IDologyFeatures, kyc_features::KycFeatureVector,
        waterfall_logic::get_kyc_rules_result,
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

#[derive(PartialEq, Eq, Debug, Clone)]
pub struct Decision {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
}

pub type DecisionReasonCodes = Vec<(FootprintReasonCode, VendorAPI)>;
pub trait FeatureVector {
    fn evaluate(&self) -> ApiResult<(OnboardingRulesDecisionOutput, DecisionReasonCodes)>;
}

pub trait FeatureSet {
    fn footprint_reason_codes(&self) -> &Vec<FootprintReasonCode>;
    fn vendor_api(&self) -> VendorAPI;
}

/// Derive rule inputs
pub fn rule_input_from_vendor_results<'a, T>(vendor_response_map: &'a VendorAPIResponseMap) -> ApiResult<T>
where
    T: TryFrom<&'a VendorAPIResponseMap>,
    T: Clone + FeatureSet,
    ApiError: std::convert::From<<T as std::convert::TryFrom<&'a VendorAPIResponseMap>>::Error>,
{
    let res = T::try_from(vendor_response_map)?;

    Ok(res)
}

pub fn evaluate_rule_set_from_vendor_results<'a, T>(
    rule_set: RuleSet<T>,
    vendor_response_map: &'a VendorAPIResponseMap,
) -> ApiResult<(OnboardingEvaluationResult, DecisionReasonCodes)>
where
    T: TryFrom<&'a VendorAPIResponseMap>,
    T: Clone + FeatureSet,
    ApiError: std::convert::From<<T as std::convert::TryFrom<&'a VendorAPIResponseMap>>::Error>,
{
    let input: T = rule_input_from_vendor_results(vendor_response_map)?;
    let reason_codes = input.footprint_reason_codes().clone();
    Ok((
        evaluate_onboarding_rule_set(rule_set, &input),
        reason_codes
            .into_iter()
            .map(|rs| (rs, input.vendor_api()))
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
    ) -> ApiResult<(OnboardingRulesDecisionOutput, DecisionReasonCodes)> {
        match self {
            RuleGroup::Kyc(rg) => rg.evaluate_kyc_rules_with_waterfall(vendor_response_map),
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
            idology_rules: rule_sets::alpaca::idology_rule_set(),
            experian_rules: rule_sets::alpaca::experian_rule_set(),
        }
    }
}
impl KycRuleGroup {
    pub fn evaluate_kyc_rules_with_waterfall(
        &self,
        vendor_response_map: &VendorAPIResponseMap,
    ) -> ApiResult<(OnboardingRulesDecisionOutput, DecisionReasonCodes)> {
        // Since we waterfall here, we don't expect all the rule results to be available. But we do expect that at least _1_ is available
        let idology_rule_result =
            evaluate_rule_set_from_vendor_results(self.idology_rules.clone(), vendor_response_map).ok();
        let experian_rule_result =
            evaluate_rule_set_from_vendor_results(self.experian_rules.clone(), vendor_response_map).ok();

        let rule_results: Vec<(OnboardingEvaluationResult, DecisionReasonCodes)> =
            vec![experian_rule_result, idology_rule_result]
                .into_iter()
                .flatten()
                .collect();
        if rule_results.is_empty() {
            Err(crate::decision::Error::from(RuleError::MissingInputForRules))?;
        }

        let (rule_result, reason_codes) = rule_results
            .into_iter()
            .min_by(|x, y| x.0.triggered_action.cmp(&y.0.triggered_action))
            .ok_or(RuleError::AssertionError("could not compute waterfall".into()))
            .map_err(crate::decision::Error::from)?;

        // If we no rules that triggered, we consider that a pass
        let (decision_status, create_manual_review) = match rule_result.triggered_action.as_ref() {
            Some(a) => (a.into(), a == &Action::ManualReview),
            None => (DecisionStatus::Pass, false),
        };

        let output = OnboardingRulesDecisionOutput {
            decision: Decision {
                should_commit: KycFeatureVector::should_commit(&rule_result.rules_triggered),
                decision_status,
                create_manual_review,
            },
            rules_triggered: rule_result.rules_triggered.to_owned(),
            rules_not_triggered: rule_result.rules_not_triggered.to_owned(),
        };

        Ok((output, reason_codes))
    }
}

// Calculate the outputs of rules
pub fn calculate_kyc_rules_output_with_waterfall(
    feature_vector: &KycFeatureVector,
    rule_group: KycRuleGroup,
) -> ApiResult<(OnboardingRulesDecisionOutput, DecisionReasonCodes)> {
    // Evaluate rules
    let idology_rule_result = feature_vector
        .idology_features
        .as_ref()
        .map(|f| rule::rules_engine::evaluate_onboarding_rule_set(rule_group.idology_rules, f));

    // TODO: add in experian once we have rules for them
    feature_vector
        .experian_features
        .as_ref()
        .map(|e| rule::rules_engine::evaluate_onboarding_rule_set(rule_group.experian_rules, e));

    // TODO: add experian in here
    // TODO: add Ord so we have a vendor preference
    let rule_results: Vec<OnboardingEvaluationResult> =
        vec![idology_rule_result].into_iter().flatten().collect();
    if rule_results.is_empty() {
        Err(crate::decision::Error::from(RuleError::MissingInputForRules))?;
    }

    let result = get_kyc_rules_result(rule_results).map_err(Error::from)?;

    // TODO: derive this better
    let reason_codes = feature_vector.reason_codes(vec![VendorAPI::TwilioLookupV2, result.vendor_api]);

    // If we no rules that triggered, we consider that a pass
    let (decision_status, create_manual_review) = match result.triggered_action.as_ref() {
        Some(a) => (a.into(), a == &Action::ManualReview),
        None => (DecisionStatus::Pass, false),
    };

    let output = OnboardingRulesDecisionOutput {
        decision: Decision {
            should_commit: KycFeatureVector::should_commit(&result.rules_triggered),
            decision_status,
            create_manual_review,
        },
        rules_triggered: result.rules_triggered.to_owned(),
        rules_not_triggered: result.rules_not_triggered.to_owned(),
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

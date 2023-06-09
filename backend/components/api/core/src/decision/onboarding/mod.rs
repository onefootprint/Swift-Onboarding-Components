use newtypes::{DecisionStatus, FootprintReasonCode, Vendor, VendorAPI, VerificationResultId};

use crate::decision::Error;
use crate::errors::ApiResult;

use super::{
    features::{
        experian::ExperianFeatures, idology_expectid::IDologyFeatures, kyc_features::KycFeatureVector,
        waterfall_logic::get_kyc_rules_result,
    },
    rule::{
        self,
        rule_set::{Action, RuleSet},
        rule_sets,
        rules_engine::OnboardingEvaluationResult,
        RuleName,
    },
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

// A rule group encodes a logic grouping of rulesets for a specific purpose.
pub enum RuleGroup {
    Kyc(KycRuleGroup),
}

pub struct KycRuleGroup {
    pub idology_rules: RuleSet<IDologyFeatures>,
    pub experian_rules: RuleSet<ExperianFeatures>,
}
impl KycRuleGroup {
    pub fn default_rules() -> Self {
        let idology_rules = rule_sets::kyc::idology_base_rule_set();
        let experian_rules = rule_sets::kyc::experian_rules();
        Self {
            idology_rules,
            experian_rules,
        }
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

    // TODO: move reason code creation and use returned VendorAPI

    let result = get_kyc_rules_result(rule_results).map_err(Error::from)?;
    // If we no rules that triggered, we consider that a pass
    let decision_status = match result.triggered_action.as_ref() {
        Some(a) => match a {
            Action::StepUp => DecisionStatus::Fail,
            Action::ManualReview => DecisionStatus::Fail,
            Action::Fail => DecisionStatus::Fail,
        },
        None => DecisionStatus::Pass,
    };

    // For now, we just queue up failures so we can see until we have a better sense of
    // what reviews we want to be doing
    let create_manual_review = decision_status == DecisionStatus::Fail;

    // TODO: derive this better
    let reason_codes = feature_vector.reason_codes(vec![VendorAPI::TwilioLookupV2, result.vendor_api]);

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

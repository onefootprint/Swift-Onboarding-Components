use db::models::onboarding_decision::OnboardingDecision;
use newtypes::{DecisionStatus, VendorAPI};

use crate::decision::features::kyb_features::KybFeatureVector;
use crate::decision::features::risk_signals::risk_signal_group_struct::Kyb;
use crate::decision::onboarding::FeatureVector;
use crate::decision::rule::RuleName;
use crate::errors::ApiResult;
use crate::ApiError;

use crate::decision::{
    features::{
        experian::ExperianFeatures,
        idology_expectid::IDologyFeatures,
        incode_docv::IncodeDocumentFeatures,
        risk_signals::{RiskSignalGroupStruct, RiskSignalsForDecision, WrappedRiskSignalGroupKind},
    },
    rule::{
        rule_set::{Action, RuleSet},
        rule_sets,
        rules_engine::{evaluate_onboarding_rule_set, OnboardingEvaluationResult},
    },
    RuleError,
};

use super::{
    Decision, DecisionResult, FeatureSet, OnboardingRulesDecision, OnboardingRulesDecisionOutput,
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

pub struct KycRuleExecutionConfig {
    pub include_doc: bool,
    pub document_only: bool,
}

pub struct KycRuleGroup {
    pub idology_rules: RuleSet<IDologyFeatures>,
    pub experian_rules: RuleSet<ExperianFeatures>,
    pub incode_doc_rules: RuleSet<IncodeDocumentFeatures>,
}

impl Default for KycRuleGroup {
    fn default() -> Self {
        Self {
            idology_rules: rule_sets::kyc::idology_rule_set(),
            experian_rules: rule_sets::kyc::experian_rule_set(),
            incode_doc_rules: rule_sets::doc::incode_rule_set(),
        }
    }
}
impl KycRuleGroup {
    pub fn evaluate(
        &self,
        risk_signals: RiskSignalsForDecision,
        config: KycRuleExecutionConfig,
    ) -> ApiResult<WaterfallOnboardingRulesDecisionOutput> {
        // Since we waterfall here, we don't expect all the rule results to be available. But we do expect that at least _1_ is available
        // (for now, until we have doc only)
        let idology_rule_result =
            evaluate_rule_set_from_risk_signals(self.idology_rules.clone(), risk_signals.kyc.clone()).ok();
        let experian_rule_result =
            evaluate_rule_set_from_risk_signals(self.experian_rules.clone(), risk_signals.kyc).ok();
        let incode_doc_rule_result =
            evaluate_rule_set_from_risk_signals(self.incode_doc_rules.clone(), risk_signals.doc).ok();

        // Check we have a KYC result from one of the vendors
        let kyc_rule_results: Vec<OnboardingEvaluationResult> =
            vec![experian_rule_result, idology_rule_result]
                .into_iter()
                .flatten()
                .collect();

        let (kyc_result, additional_results) = if !config.document_only {
            // First we evaluate KYC, choosing which of the potentially multiple vendors we might have
            let kyc_result = kyc_rule_results
                .iter()
                .min_by(|x, y| x.triggered_action.cmp(&y.triggered_action))
                .ok_or(RuleError::MissingInputForKYCRules)
                .map_err(crate::decision::Error::from)?
                .clone();

            let additional_results = kyc_rule_results
                .into_iter()
                .filter(|ober| ober != &kyc_result)
                .map(OnboardingRulesDecisionOutput::from)
                .collect();

            (
                DecisionResult::Evaluated(OnboardingRulesDecisionOutput::from(kyc_result)),
                additional_results,
            )
        } else {
            (DecisionResult::NotRequired, vec![])
        };

        // handle document decisioning
        let doc_result = if config.include_doc {
            DecisionResult::Evaluated(Self::handle_doc_result(incode_doc_rule_result))
        } else {
            DecisionResult::NotRequired
        };

        if config.include_doc && !matches!(doc_result, DecisionResult::Evaluated(_)) {
            Err(crate::decision::Error::from(RuleError::MissingInputForDocRules))?
        }

        let output = WaterfallOnboardingRulesDecisionOutput::new(kyc_result, doc_result, additional_results);

        Ok(output)
    }

    fn handle_doc_result(
        incode_doc_rule_result: Option<OnboardingEvaluationResult>,
    ) -> OnboardingRulesDecisionOutput {
        match incode_doc_rule_result {
            Some(r) => r.into(),
            // If we are expecting a document, and there are so rules evaluated, probably what happened
            // was that the user had an issue with uploading their document
            None => {
                tracing::error!("missing incode doc rules result");
                OnboardingEvaluationResult {
                    rules_triggered: vec![RuleName::DocumentUploadFailed],
                    rules_not_triggered: vec![],
                    triggered_action: Some(Action::ManualReview),
                    vendor_api: VendorAPI::IncodeFetchScores,
                }
                .into()
            }
        }
    }
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
                // TODO: fix this
                should_commit: should_commit(&result.rules_triggered),
                decision_status,
                create_manual_review,
                vendor_api: result.vendor_api,
            },
            rules_triggered: result.rules_triggered.to_owned(),
            rules_not_triggered: result.rules_not_triggered.to_owned(),
        }
    }
}

// For now, we have very simple logic to decide when to commit which is just "if the only thing
// that failed this user is a watchlist hit, commit"
// More thoughts: https://www.notion.so/onefootprint/Design-Doc-Portabilization-Decision-71f1cfb945234c58b74e97f005211917?pvs=4
pub fn should_commit(rules_triggered: &Vec<RuleName>) -> bool {
    rules_triggered.is_empty()
        || (rules_triggered.len() == 1 && rules_triggered.contains(&RuleName::WatchlistHit))
}

pub fn evaluate_kyb_rules(
    rsg: RiskSignalGroupStruct<Kyb>,
    bo_obds: Vec<OnboardingDecision>,
) -> ApiResult<OnboardingRulesDecision> {
    let reason_codes = rsg
        .footprint_reason_codes
        .into_iter()
        .map(|(rc, _, _)| rc)
        .collect();
    let fv = KybFeatureVector::new(reason_codes, bo_obds);
    fv.evaluate()
}

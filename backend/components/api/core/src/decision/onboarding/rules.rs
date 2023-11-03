use db::models::onboarding_decision::OnboardingDecision;
use newtypes::{DecisionStatus, FootprintReasonCode, RuleAction, RuleName, VendorAPI};

use crate::decision::features::kyb_features::KybFeatureVector;
use crate::decision::features::risk_signals::risk_signal_group_struct::Kyb;
use crate::decision::onboarding::FeatureVector;
use crate::decision::rule::rule_set::Rule;
use crate::decision::rule::rule_sets::RiskSignalRuleEvaluator;
use crate::errors::ApiResult;

use crate::decision::{
    features::risk_signals::{RiskSignalGroupStruct, RiskSignalsForDecision},
    rule::{rule_sets, rules_engine::OnboardingEvaluationResult},
    RuleError,
};

use super::{
    Decision, DecisionResult, OnboardingRulesDecision, OnboardingRulesDecisionOutput,
    WaterfallOnboardingRulesDecisionOutput,
};

#[derive(Clone)]
pub struct KycRuleExecutionConfig {
    pub include_doc: bool,
    pub document_only: bool,
    pub skip_kyc: bool,
}

impl KycRuleExecutionConfig {
    pub fn for_kyc_only() -> Self {
        Self {
            include_doc: false,
            document_only: false,
            skip_kyc: false,
        }
    }
}

#[derive(Clone)]
pub struct KycRuleGroup {
    pub kyc_rules: Vec<Rule<Vec<FootprintReasonCode>>>,
    pub doc_rules: Vec<Rule<Vec<FootprintReasonCode>>>,
    pub aml_rules: Vec<Rule<Vec<FootprintReasonCode>>>,
}

impl KycRuleGroup {
    fn risk_signal_rule_evaluator(&self) -> RiskSignalRuleEvaluator {
        RiskSignalRuleEvaluator::new(
            self.kyc_rules.clone(),
            self.doc_rules.clone(),
            self.aml_rules.clone(),
        )
    }
}

impl Default for KycRuleGroup {
    fn default() -> Self {
        Self {
            kyc_rules: rule_sets::kyc::kyc_rules(),
            doc_rules: rule_sets::doc::incode_rules(),
            aml_rules: rule_sets::common::aml_rules(),
        }
    }
}
impl KycRuleGroup {
    pub fn evaluate(
        &self,
        risk_signals: RiskSignalsForDecision,
        config: KycRuleExecutionConfig,
    ) -> ApiResult<WaterfallOnboardingRulesDecisionOutput> {
        let rule_result = self.risk_signal_rule_evaluator().evaluate(risk_signals);

        let kyc_result = if !(config.document_only || config.skip_kyc) {
            // First we evaluate KYC, choosing which of the potentially multiple vendors we might have
            let kyc_result = rule_result
                .kyc
                .ok_or(RuleError::MissingInputForKYCRules)
                .map_err(crate::decision::Error::from)?;

            DecisionResult::Evaluated(OnboardingRulesDecisionOutput::from(kyc_result))
        } else {
            DecisionResult::NotRequired
        };

        // handle document decisioning
        let doc_result = if config.include_doc {
            DecisionResult::Evaluated(Self::handle_doc_result(rule_result.doc))
        } else {
            DecisionResult::NotRequired
        };

        if config.include_doc && !matches!(doc_result, DecisionResult::Evaluated(_)) {
            Err(crate::decision::Error::from(RuleError::MissingInputForDocRules))?
        }

        // :thinkies: we don't generate watchlist FRCs if there's no WL hits, so we can't tell the difference between no watchlist hit and no FRCs generated (incorrectly). i think that's ok for now, and
        // this is prob the wrong place for that
        let aml_decision = if let Some(aml_decision) = rule_result.aml {
            DecisionResult::Evaluated(aml_decision.into())
        } else {
            // not required if doc only, or no WL FRCs to eval
            DecisionResult::NotRequired
        };

        let output = WaterfallOnboardingRulesDecisionOutput::new(kyc_result, doc_result, aml_decision);

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
                    triggered_action: Some(RuleAction::ManualReview),
                    vendor_apis: vec![VendorAPI::IncodeFetchScores, VendorAPI::IncodeFetchOcr],
                }
                .into()
            }
        }
    }
}

impl From<OnboardingEvaluationResult> for OnboardingRulesDecisionOutput {
    fn from(result: OnboardingEvaluationResult) -> Self {
        // If we no rules that triggered, we consider that a pass
        let (decision_status, create_manual_review) = match result.triggered_action.as_ref() {
            Some(a) => (a.into(), a.should_create_review()),
            None => (DecisionStatus::Pass, false),
        };

        OnboardingRulesDecisionOutput {
            decision: Decision {
                // TODO: fix this
                should_commit: should_commit(&result.rules_triggered, &result.triggered_action),
                decision_status,
                create_manual_review,
                vendor_apis: result.vendor_apis,
            },
            rules_triggered: result.rules_triggered.to_owned(),
            rules_not_triggered: result.rules_not_triggered.to_owned(),
        }
    }
}

// For now, we have very simple logic to decide when to commit which is just "if the only thing
// that failed this user is a watchlist hit, commit"
// More thoughts: https://www.notion.so/onefootprint/Design-Doc-Portabilization-Decision-71f1cfb945234c58b74e97f005211917?pvs=4
pub fn should_commit(rules_triggered: &Vec<RuleName>, triggered_action: &Option<RuleAction>) -> bool {
    // TODO: codify our own proper set of Rule's for determining should_commit
    rules_triggered.is_empty()
        || (rules_triggered.len() == 1 && rules_triggered.contains(&RuleName::WatchlistHit))
        || matches!(triggered_action, Some(RuleAction::StepUp)) // TODO: when we handle enforcing that StepUp cannot be a triggered_action if doc was already collected, we can remove this hack
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

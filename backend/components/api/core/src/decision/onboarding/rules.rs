use db::models::onboarding_decision::OnboardingDecision;
use newtypes::{DecisionStatus, RuleAction, RuleName};

use crate::decision::features::kyb_features::KybFeatureVector;
use crate::decision::features::risk_signals::risk_signal_group_struct::Kyb;
use crate::decision::onboarding::FeatureVector;
use crate::decision::{
    features::risk_signals::RiskSignalGroupStruct, rule::rules_engine::OnboardingEvaluationResult,
};
use crate::errors::ApiResult;

use super::{Decision, OnboardingRulesDecision, OnboardingRulesDecisionOutput};

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
    rules_triggered.is_empty() // probs redundant now 
        || (rules_triggered.len() == 1 && rules_triggered.contains(&RuleName::WatchlistHit))
        || matches!(triggered_action, Some(RuleAction::StepUp) | None) // TODO: when we handle enforcing that StepUp cannot be a triggered_action if doc was already collected, we can remove this hack- ok jk still can't remove this
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

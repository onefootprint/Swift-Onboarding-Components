use itertools::{chain, Itertools};
use newtypes::{
    DbActor, DecisionStatus, DocumentRequestConfig, DocumentReviewStatus, ManualReviewKind, OnboardingStatus,
    ReviewReason, RuleSetResultId, VerificationResultId, WorkflowId, WorkflowSource,
};

use db::{
    models::{
        data_lifetime::DataLifetime,
        document::Document,
        manual_review::{ManualReviewAction, ManualReviewArgs},
        ob_configuration::ObConfiguration,
        onboarding_decision::{FailedForDocReview, NewDecisionArgs},
        scoped_vault::ScopedVault,
        workflow::{Workflow, WorkflowUpdate},
    },
    TxnPgConn,
};

use super::onboarding::Decision;
use crate::{errors::ApiResult, utils::vault_wrapper::VaultWrapper};

/// Create our final decision from the features we created, set final onboarding status, and emit risk signals
/// assert_is_first_decision_for_onboarding determines if an error should be thrown if the onboarding already has a decision made
///     we set this true to perform this check during the initial decisioning we make at the end of Bifrost.
///     we also can make decisions post-Bifrost, when we manually trigger a running of decisioning and in those cases we would set this false
#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip(conn))]
pub fn save_final_decision(
    conn: &mut TxnPgConn,
    wf_id: &WorkflowId,
    verification_result_ids: Vec<VerificationResultId>,
    decision: Decision,
    rsr_id: Option<RuleSetResultId>,
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<()> {
    let wf = Workflow::lock(conn, wf_id)?;
    let scoped_user = ScopedVault::get(conn, &wf.scoped_vault_id)?;
    let (obc, _) = ObConfiguration::get(conn, wf_id)?;

    // If we should commit, portablize all data for the onboarding
    // But, don't portabalize vaults from no-phone onboardings,
    // and don't portablize vaults from tenant-initiated flows via POST /kyc
    let seqno = if decision.should_commit() && !obc.is_no_phone_flow && wf.source != WorkflowSource::Tenant {
        // We may decide to start portablizing data from tenant-initiated workflows, but leave
        // the vaults un-identifiable.
        // Make sure our product stats reflect this if we do so
        let vw = VaultWrapper::lock_for_onboarding(conn, &wf.scoped_vault_id)?;
        // Explicitly use the seqno from portablizing data on the decision
        vw.portablize_identity_data(conn)?
    } else {
        DataLifetime::get_current_seqno(conn)?
    };

    let rules_manual_review = decision.create_manual_review().then_some(ManualReviewArgs {
        kind: ManualReviewKind::RuleTriggered,
        action: ManualReviewAction::GetOrCreate { review_reasons },
    });
    let doc_manual_review = {
        let docs = Document::list_by_wf_id(conn, &wf.id)?;
        let docs_needing_human_review = docs
            .into_iter()
            .filter(|(d, _)| d.review_status == DocumentReviewStatus::PendingHumanReview)
            .collect_vec();
        let review_reasons = docs_needing_human_review
            .iter()
            .filter_map(|(_, dr)| match dr.config {
                DocumentRequestConfig::Identity { .. } => None,
                DocumentRequestConfig::ProofOfSsn {} => Some(ReviewReason::ProofOfSsnDocument),
                DocumentRequestConfig::ProofOfAddress {} => Some(ReviewReason::ProofOfAddressDocument),
                DocumentRequestConfig::Custom { .. } => Some(ReviewReason::CustomDocument),
            })
            .collect_vec();
        (!docs_needing_human_review.is_empty()).then_some(ManualReviewArgs {
            kind: ManualReviewKind::DocumentNeedsReview,
            action: ManualReviewAction::GetOrCreate { review_reasons },
        })
    };

    let sv = ScopedVault::get(conn, &wf.scoped_vault_id)?;
    let (status, failed_for_doc_review) =
        get_final_decision_status(decision, doc_manual_review.is_some(), sv.status);

    let manual_reviews = chain(rules_manual_review, doc_manual_review).collect();
    if status == DecisionStatus::StepUp {
        tracing::error!(%wf_id, "Saving final decision with non-terminal status");
    }
    let decision = NewDecisionArgs {
        vault_id: scoped_user.vault_id,
        logic_git_hash: crate::GIT_HASH.to_string(),
        status,
        failed_for_doc_review,
        result_ids: verification_result_ids,
        annotation_id: None,
        actor: DbActor::Footprint,
        seqno,
        manual_reviews,
        rule_set_result_id: rsr_id,
    };

    let update = WorkflowUpdate::set_decision(&wf, decision);
    Workflow::update(wf, conn, update)?;

    Ok(())
}

fn get_final_decision_status(
    decision: Decision,
    has_doc_mr: bool,
    existing_status: Option<OnboardingStatus>,
) -> (DecisionStatus, FailedForDocReview) {
    let can_fail_for_doc_review = has_doc_mr && existing_status != Some(OnboardingStatus::Pass);

    match decision {
        Decision::RulesExecuted { action, .. } => match action.map(DecisionStatus::from) {
            Some(status) => (status, false),
            // If there's a document MR and the user doesn't already have a pass status, we'll fail them.
            // This is a kind of implicit rule.
            None if can_fail_for_doc_review => (DecisionStatus::Fail, true),
            // Default to pass if no rules were triggered
            None => (DecisionStatus::Pass, false),
        },
        // If there's a document MR and the user doesn't already have a pass status, we'll fail them.
        // This is a kind of implicit rule.
        Decision::RulesNotExecuted if can_fail_for_doc_review => (DecisionStatus::Fail, true),
        // TODO eventually stop defaulting to pass when no rules executed
        Decision::RulesNotExecuted => (DecisionStatus::Pass, false),
    }
}

#[cfg(test)]
mod test {
    use crate::decision::onboarding::Decision;

    use super::get_final_decision_status;
    use newtypes::{DecisionStatus, OnboardingStatus, RuleAction};
    use test_case::test_case;

    fn rules_executed(action: Option<RuleAction>) -> Decision {
        Decision::RulesExecuted {
            should_commit: true,
            create_manual_review: false,
            action,
        }
    }

    // Test no existing status, no doc manual review, simple cases
    #[test_case(Decision::RulesNotExecuted, false, None => DecisionStatus::Pass)]
    #[test_case(rules_executed(None), false, None => DecisionStatus::Pass)]
    #[test_case(rules_executed(Some(RuleAction::PassWithManualReview)), false, None => DecisionStatus::Pass)]
    #[test_case(rules_executed(Some(RuleAction::Fail)), false, None => DecisionStatus::Fail)]
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), false, None => DecisionStatus::Fail)]
    #[test_case(rules_executed(Some(RuleAction::Fail)), false, Some(OnboardingStatus::Pass) => DecisionStatus::Fail)]
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), false, Some(OnboardingStatus::Pass) => DecisionStatus::Fail)]
    // Fail for document MR
    #[test_case(Decision::RulesNotExecuted, true, None => DecisionStatus::Fail)]
    #[test_case(Decision::RulesNotExecuted, true, Some(OnboardingStatus::Pending) => DecisionStatus::Fail)]
    #[test_case(rules_executed(None), true, None => DecisionStatus::Fail)]
    #[test_case(rules_executed(None), true, Some(OnboardingStatus::Incomplete) => DecisionStatus::Fail)]
    // Don't set user to fail for doc review if they're already passed
    #[test_case(Decision::RulesNotExecuted, true, Some(OnboardingStatus::Pass) => DecisionStatus::Pass)]
    #[test_case(rules_executed(None), true, Some(OnboardingStatus::Pass) => DecisionStatus::Pass)]
    // Doc manual review doesn't matter much when there's a rule action.
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), true, Some(OnboardingStatus::Pass) => DecisionStatus::Fail)]
    // This one is weird behavior - we should probably fail the user if there's a doc MR + PassWithManualReview. But just testing existing behavior for now
    #[test_case(rules_executed(Some(RuleAction::PassWithManualReview)), true, Some(OnboardingStatus::Pass) => DecisionStatus::Pass)]
    fn test_get_final_decision_status(
        decision: Decision,
        has_doc_mr: bool,
        existing_status: Option<OnboardingStatus>,
    ) -> DecisionStatus {
        get_final_decision_status(decision, has_doc_mr, existing_status).0
    }

    #[test_case(Decision::RulesNotExecuted, false, None => false)]
    #[test_case(rules_executed(None), false, None => false)]
    #[test_case(rules_executed(Some(RuleAction::Fail)), false, None => false)]
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), false, None => false)]
    // Fail for document MR
    #[test_case(Decision::RulesNotExecuted, true, None => true)]
    #[test_case(Decision::RulesNotExecuted, true, Some(OnboardingStatus::Pending) => true)]
    #[test_case(rules_executed(None), true, None => true)]
    #[test_case(rules_executed(None), true, Some(OnboardingStatus::Incomplete) => true)]
    // Don't set user to fail for doc review if they're already passed
    #[test_case(Decision::RulesNotExecuted, true, Some(OnboardingStatus::Pass) => false)]
    // Doc manual review doesn't matter much when there's a rule action.
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), true, Some(OnboardingStatus::Pass) => false)]
    // This one is weird behavior - we should probably fail the user if there's a doc MR + PassWithManualReview. But just testing existing behavior for now
    #[test_case(rules_executed(Some(RuleAction::PassWithManualReview)), true, Some(OnboardingStatus::Pass) => false)]
    fn test_get_final_decision_status_fail_for_mr(
        decision: Decision,
        has_doc_mr: bool,
        existing_status: Option<OnboardingStatus>,
    ) -> bool {
        get_final_decision_status(decision, has_doc_mr, existing_status).1
    }
}

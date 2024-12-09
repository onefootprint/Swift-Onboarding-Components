use super::onboarding::RulesOutcome;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use api_errors::ServerErrInto;
use api_wire_types::RuleResultRuleAction;
use db::models::data_lifetime::DataLifetime;
use db::models::document::Document;
use db::models::manual_review::ManualReviewAction;
use db::models::manual_review::ManualReviewArgs;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding_decision::FailedForDocReview;
use db::models::onboarding_decision::NewDecisionArgs;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::playbook::Playbook;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::workflow::Workflow;
use db::TxnPgConn;
use itertools::chain;
use itertools::Itertools;
use newtypes::DbActor;
use newtypes::DecisionStatus;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentReviewStatus;
use newtypes::ManualReviewKind;
use newtypes::OnboardingStatus;
use newtypes::ReviewReason;
use newtypes::RuleAction;
use newtypes::RuleSetResultId;
use newtypes::WorkflowId;
use newtypes::WorkflowSource;

/// Create our final decision from the features we created, set final onboarding status, and emit
/// risk signals assert_is_first_decision_for_onboarding determines if an error should be thrown if
/// the onboarding already has a decision made     we set this true to perform this check during the
/// initial decisioning we make at the end of Bifrost.     we also can make decisions post-Bifrost,
/// when we manually trigger a running of decisioning and in those cases we would set this false
#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip(conn))]
pub fn save_final_decision(
    conn: &mut TxnPgConn,
    wf_id: &WorkflowId,
    rules_outcome: RulesOutcome,
    rsr_id: Option<RuleSetResultId>,
    review_reasons: Vec<ReviewReason>,
) -> FpResult<()> {
    let wf = Workflow::lock(conn, wf_id)?;
    let (playbook, obc) = ObConfiguration::get(conn, wf_id)?;
    let tenant = Tenant::get(conn, &playbook.tenant_id)?;

    // If we should commit, portablize all data for the onboarding
    // But, don't portabalize vaults from no-phone onboardings,
    // and don't portablize vaults from tenant-initiated flows via POST /kyc
    let sv_txn =
        if rules_outcome.should_commit() && !obc.is_no_phone_flow && wf.source != WorkflowSource::Tenant {
            // We may decide to start portablizing data from tenant-initiated workflows, but leave
            // the vaults un-identifiable.
            // Make sure our product stats reflect this if we do so
            let vw = VaultWrapper::lock_for_onboarding(conn, &wf.scoped_vault_id)?;
            // Explicitly use the seqno from portablizing data on the decision
            vw.portablize_identity_data(conn)?
        } else {
            let sv = ScopedVault::lock(conn, &wf.scoped_vault_id)?;
            DataLifetime::new_sv_txn(conn, sv)?
        };

    let rules_manual_review = rules_outcome.create_manual_review().then_some(ManualReviewArgs {
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
                DocumentRequestConfig::ProofOfSsn { .. } => Some(ReviewReason::ProofOfSsnDocument),
                DocumentRequestConfig::ProofOfAddress { .. } => Some(ReviewReason::ProofOfAddressDocument),
                DocumentRequestConfig::Custom { .. } => Some(ReviewReason::CustomDocument),
            })
            .collect_vec();
        (!docs_needing_human_review.is_empty()).then_some(ManualReviewArgs {
            kind: ManualReviewKind::DocumentNeedsReview,
            action: ManualReviewAction::GetOrCreate { review_reasons },
        })
    };

    let sv = ScopedVault::get(conn, &wf.scoped_vault_id)?;
    let has_doc_mr = doc_manual_review.is_some();
    let (status, failed_for_doc_review) =
        get_final_decision_status(rules_outcome.clone(), has_doc_mr, sv.status)?;

    let manual_reviews = chain(rules_manual_review, doc_manual_review).collect();

    // Bookkeeping if this is the first Footprint decision
    if wf.decision_made_at.is_none() {
        Workflow::set_decision_made_at(conn, &wf.id)?;
    }

    // Create an OBD, update ManualReviews, and update Workflow state
    let new_decision = NewDecisionArgs {
        sv_txn: &sv_txn,
        logic_git_hash: crate::GIT_HASH.to_string(),
        status,
        failed_for_doc_review,
        annotation_id: None,
        actor: DbActor::Footprint,
        manual_reviews,
        rule_set_result_id: rsr_id,
    };
    let (obd, mr_deltas) = OnboardingDecision::create_decision_and_mrs(conn, &wf, new_decision)?;
    let (wf, wf_delta, sv_delta) = Workflow::update_status_if_valid(wf, conn, obd.status.into())?;
    wf.maybe_fire_completed_webhook(conn, wf_delta, mr_deltas)?;
    wf.maybe_fire_status_changed_webhook(conn, sv_delta, mr_deltas)?;

    log_canonical_line(&playbook, &obc, rules_outcome, &obd, &tenant);

    Ok(())
}

fn get_final_decision_status(
    decision: RulesOutcome,
    has_doc_mr: bool,
    existing_status: OnboardingStatus,
) -> FpResult<(DecisionStatus, FailedForDocReview)> {
    let can_fail_for_doc_review = has_doc_mr && existing_status != OnboardingStatus::Pass;

    let result = match decision {
        RulesOutcome::RulesExecuted { action, .. } => match action {
            Some(action) => {
                let status = match action {
                    RuleAction::PassWithManualReview => DecisionStatus::Pass,
                    RuleAction::ManualReview => DecisionStatus::Fail,
                    RuleAction::Fail => DecisionStatus::Fail,
                    RuleAction::StepUp(_) => return ServerErrInto!("Received StepUp action in decisioning"),
                };
                (status, false)
            }
            // If there's a document MR and the user doesn't already have a pass status, we'll fail them.
            // This is a kind of implicit rule needed to put users in fail after a step up to provide, eg, PoA
            None if can_fail_for_doc_review => (DecisionStatus::Fail, true),
            // Default to pass if no rules were triggered
            None => (DecisionStatus::Pass, false),
        },
        // Even if there's a doc manual review, we will unconditionally return `None` if rules didn't execute
        // (and not fail the user). The rule to "fail a user if there's a document review" is kind of like
        // an implicit rule, so we don't want to run it if rules don't run at all
        RulesOutcome::RulesNotExecuted => (DecisionStatus::None, false),
    };
    Ok(result)
}

fn log_canonical_line(
    playbook: &Playbook,
    obc: &ObConfiguration,
    rules_outcome: RulesOutcome,
    obd: &OnboardingDecision,
    tenant: &Tenant,
) {
    let action = match rules_outcome {
        RulesOutcome::RulesExecuted { action, .. } => action,
        RulesOutcome::RulesNotExecuted => None,
    };

    tracing::info!(
        playbook_key=%playbook.key,
        // TODO(ethan): remove after ~December 15, 2024.
        obc_key=%playbook.key,
        should_commit=%rules_outcome.should_commit(),
        create_manual_review=rules_outcome.create_manual_review(),
        action=%RuleResultRuleAction::from(action),
        decision_status=%obd.status,
        failed_for_doc_review=%obd.failed_for_doc_review,
        is_live=%playbook.is_live,
        tenant_id=%playbook.tenant_id,
        tenant_name=%tenant.name,
        kind=%obc.kind,
        name = "CANONICAL-WORKFLOW-COMPLETE"
    );
}

#[cfg(test)]
mod test {
    use super::get_final_decision_status;
    use crate::decision::onboarding::RulesOutcome;
    use newtypes::DecisionStatus;
    use newtypes::OnboardingStatus;
    use newtypes::RuleAction;
    use test_case::test_case;

    fn rules_executed(action: Option<RuleAction>) -> RulesOutcome {
        RulesOutcome::RulesExecuted {
            should_commit: true,
            create_manual_review: false,
            action,
            rule_action: action.map(|a| a.to_rule_action()),
        }
    }

    // Test no existing status, no doc manual review, simple cases
    #[test_case(RulesOutcome::RulesNotExecuted, false, OnboardingStatus::None => DecisionStatus::None)]
    #[test_case(rules_executed(None), false, OnboardingStatus::None => DecisionStatus::Pass)]
    #[test_case(rules_executed(Some(RuleAction::PassWithManualReview)), false, OnboardingStatus::None => DecisionStatus::Pass)]
    #[test_case(rules_executed(Some(RuleAction::Fail)), false, OnboardingStatus::None => DecisionStatus::Fail)]
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), false, OnboardingStatus::None => DecisionStatus::Fail)]
    #[test_case(rules_executed(Some(RuleAction::Fail)), false, OnboardingStatus::Pass => DecisionStatus::Fail)]
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), false, OnboardingStatus::Pass => DecisionStatus::Fail)]
    #[test_case(RulesOutcome::RulesNotExecuted, true, OnboardingStatus::None => DecisionStatus::None)]
    #[test_case(RulesOutcome::RulesNotExecuted, true, OnboardingStatus::Pending => DecisionStatus::None)]
    #[test_case(RulesOutcome::RulesNotExecuted, true, OnboardingStatus::Pass => DecisionStatus::None)]
    // Fail for document MR
    #[test_case(rules_executed(None), true, OnboardingStatus::None => DecisionStatus::Fail)]
    #[test_case(rules_executed(None), true, OnboardingStatus::Incomplete => DecisionStatus::Fail)]
    // Don't set user to fail for doc review if they're already passed
    #[test_case(rules_executed(None), true, OnboardingStatus::Pass => DecisionStatus::Pass)]
    // Doc manual review doesn't matter much when there's a rule action.
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), true, OnboardingStatus::Pass => DecisionStatus::Fail)]
    // This one is weird behavior - we should probably fail the user if there's a doc MR +
    // PassWithManualReview. But just testing existing behavior for now
    #[test_case(rules_executed(Some(RuleAction::PassWithManualReview)), true, OnboardingStatus::Pass => DecisionStatus::Pass)]
    fn test_get_final_decision_status(
        decision: RulesOutcome,
        has_doc_mr: bool,
        existing_status: OnboardingStatus,
    ) -> DecisionStatus {
        get_final_decision_status(decision, has_doc_mr, existing_status)
            .unwrap()
            .0
    }

    #[test_case(RulesOutcome::RulesNotExecuted, false, OnboardingStatus::None => false)]
    #[test_case(rules_executed(None), false, OnboardingStatus::None => false)]
    #[test_case(rules_executed(Some(RuleAction::Fail)), false, OnboardingStatus::None => false)]
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), false, OnboardingStatus::None => false)]
    #[test_case(RulesOutcome::RulesNotExecuted, true, OnboardingStatus::None => false)]
    #[test_case(RulesOutcome::RulesNotExecuted, false, OnboardingStatus::Pending => false)]
    #[test_case(RulesOutcome::RulesNotExecuted, true, OnboardingStatus::Pass => false)]
    // Fail for document MR
    #[test_case(rules_executed(None), true, OnboardingStatus::None => true)]
    #[test_case(rules_executed(None), true, OnboardingStatus::Incomplete => true)]
    // Don't set user to fail for doc review if they're already passed
    #[test_case(rules_executed(None), true, OnboardingStatus::Pass => false)]
    // Doc manual review doesn't matter much when there's a rule action.
    #[test_case(rules_executed(Some(RuleAction::ManualReview)), true, OnboardingStatus::Pass => false)]
    // This one is weird behavior - we should probably fail the user if there's a doc MR +
    // PassWithManualReview. But just testing existing behavior for now
    #[test_case(rules_executed(Some(RuleAction::PassWithManualReview)), true, OnboardingStatus::Pass => false)]
    fn test_get_final_decision_status_fail_for_mr(
        decision: RulesOutcome,
        has_doc_mr: bool,
        existing_status: OnboardingStatus,
    ) -> bool {
        get_final_decision_status(decision, has_doc_mr, existing_status)
            .unwrap()
            .1
    }
}

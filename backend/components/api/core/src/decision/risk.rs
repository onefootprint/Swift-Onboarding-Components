use newtypes::{
    DbActor, DecisionStatus, ManualReviewKind, OnboardingStatus, ReviewReason, RuleSetResultId,
    VerificationResultId, WorkflowId, WorkflowSource,
};

use db::{
    models::{
        data_lifetime::DataLifetime,
        manual_review::{ManualReviewAction, ManualReviewArgs},
        ob_configuration::ObConfiguration,
        onboarding_decision::NewDecisionArgs,
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

    let manual_review = decision.create_manual_review().then_some(ManualReviewArgs {
        kind: ManualReviewKind::RuleTriggered,
        action: ManualReviewAction::GetOrCreate { review_reasons },
    });
    let manual_reviews = manual_review.into_iter().collect();

    let sv = ScopedVault::get(conn, &wf.scoped_vault_id)?;
    let status = match decision {
        Decision::RulesExecuted { action, .. } => action.map(DecisionStatus::from),
        // If rules didn't execute, default to the existing scoped vault status
        Decision::RulesNotExecuted => match sv.status {
            Some(OnboardingStatus::Pass) => Some(DecisionStatus::Pass),
            Some(OnboardingStatus::Fail) => Some(DecisionStatus::Fail),
            // If the first playbook you onboard onto doesn't have rules, it will pass/fail you
            // according to logic below
            Some(OnboardingStatus::Incomplete) | Some(OnboardingStatus::Pending) | None => None,
        },
    };
    // Fall back to pass for now
    // TODO in future, fail if we're raising manual review for docs
    let status = status.unwrap_or(DecisionStatus::Pass);

    if status == DecisionStatus::StepUp {
        tracing::error!(%wf_id, "Saving final decision with non-terminal status");
    }
    let decision = NewDecisionArgs {
        vault_id: scoped_user.vault_id,
        logic_git_hash: crate::GIT_HASH.to_string(),
        status,
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

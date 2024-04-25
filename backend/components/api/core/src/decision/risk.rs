use newtypes::{
    DbActor, ManualReviewKind, ReviewReason, RuleSetResultId, VerificationResultId, WorkflowId,
    WorkflowSource,
};

use db::{
    models::{
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
    wf_id: WorkflowId,
    verification_result_ids: Vec<VerificationResultId>,
    decision: &Decision,
    rule_set_result_id: Option<&RuleSetResultId>, // TODO: mb just pass in RuleSetResult at this point and then get Decision from that? just need to pull should_commit out of Decision
    // TODO make this non-null soon
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<()> {
    // TODO: Create our risk signals!
    // Save status
    let wf = Workflow::lock(conn, &wf_id)?;
    let scoped_user = ScopedVault::get(conn, &wf.scoped_vault_id)?;

    // If we should commit, portablize all data for the onboarding
    let seqno = if decision.should_commit {
        let vw = VaultWrapper::lock_for_onboarding(conn, &wf.scoped_vault_id)?;
        let (obc, _) = ObConfiguration::get(conn, &wf_id)?;
        // don't portabalize vaults from no-phone onboardings
        // and don't portablize vaults from tenant-initiated flows via POST /kyc
        if !obc.is_no_phone_flow && wf.source != WorkflowSource::Tenant {
            // We may decide to start portablizing data from tenant-initiated workflows, but leave
            // the vaults un-identifiable.
            // Make sure our product stats reflect this if we do so
            let seqno = vw.portablize_identity_data(conn)?;
            Some(seqno)
        } else {
            None
        }
    } else {
        None
    };

    let manual_review = decision.create_manual_review.then_some(ManualReviewArgs {
        kind: ManualReviewKind::RuleTriggered,
        action: ManualReviewAction::GetOrCreate { review_reasons },
    });
    let manual_reviews = manual_review.into_iter().collect();
    let decision = NewDecisionArgs {
        vault_id: scoped_user.vault_id,
        logic_git_hash: crate::GIT_HASH.to_string(),
        status: decision.decision_status,
        result_ids: verification_result_ids,
        annotation_id: None,
        actor: DbActor::Footprint,
        seqno,
        manual_reviews,
        rule_set_result_id: rule_set_result_id.cloned(),
    };

    // TODO: Make a billable event here
    // NOTE: must do this after completing the manual review
    let update = WorkflowUpdate::set_decision(&wf, decision);
    Workflow::update(wf, conn, update)?;

    Ok(())
}

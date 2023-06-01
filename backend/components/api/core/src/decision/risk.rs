use newtypes::{DbActor, FootprintReasonCode, OnboardingId, Vendor, VerificationResultId, WorkflowId};

use db::{
    models::{
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::RiskSignal,
        scoped_vault::ScopedVault,
    },
    TxnPgConn,
};

use super::onboarding::OnboardingRulesDecisionOutput;
use crate::{
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::VaultWrapper,
};

/// Create our final decision from the features we created, set final onboarding status, and emit risk signals
/// assert_is_first_decision_for_onboarding determines if an error should be thrown if the onboarding already has a decision made
///     we set this true to perform this check during the initial decisioning we make at the end of Bifrost.
///     we also can make decisions post-Bifrost, when we manually trigger a running of decisioning and in those cases we would set this false
#[tracing::instrument(skip(conn))]
pub fn save_final_decision(
    conn: &mut TxnPgConn,
    ob_id: OnboardingId,
    reason_codes: Vec<(FootprintReasonCode, Vec<Vendor>)>,
    verification_result_ids: Vec<VerificationResultId>,
    decision: &OnboardingRulesDecisionOutput,
    assert_is_first_decision_for_onboarding: bool,
    workflow_id: Option<WorkflowId>,
) -> ApiResult<OnboardingDecision> {
    // TODO build process to run this asynchronously if we crashed before getting here
    // TODO: Create our risk signals!
    // Save status
    let ob = Onboarding::lock(conn, &ob_id)?;
    let scoped_user = ScopedVault::get(conn, &ob.scoped_vault_id)?;

    // prevent race conditions from producing 2 decisions
    if assert_is_first_decision_for_onboarding && ob.decision_made_at.is_some() {
        return Err(OnboardingError::OnboardingDecisionNotNeeded.into());
    }

    // If we should commit, mark all data as verified for the onboarding
    let seqno = if decision.should_commit {
        let uvw = VaultWrapper::lock_for_onboarding(conn, &ob.scoped_vault_id)?;
        let seqno = uvw.portablize_identity_data(conn)?;
        Some(seqno)
    } else {
        None
    };

    // Create decision
    let onboarding_decision = OnboardingDecisionCreateArgs {
        vault_id: scoped_user.vault_id,
        onboarding: &ob,
        logic_git_hash: crate::GIT_HASH.to_string(),
        status: decision.decision_status,
        result_ids: verification_result_ids,
        annotation_id: None,
        actor: DbActor::Footprint,
        seqno,
        workflow_id,
    };
    let obd = OnboardingDecision::create(conn, onboarding_decision)?;

    let ob = ob.into_inner();
    // Make a billable event here
    ob.update(
        conn,
        OnboardingUpdate::set_has_final_decision(decision.decision_status),
    )?;

    // Create ManualReview row if requested
    if decision.create_manual_review {
        ManualReview::create(conn, ob_id)?;
    }

    RiskSignal::bulk_create(conn, obd.id.clone(), reason_codes)?;
    Ok(obd)
}

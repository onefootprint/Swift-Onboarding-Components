use newtypes::{DbActor, OnboardingId, ReviewReason, VerificationResultId, WorkflowId};

use db::{
    models::{
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::{NewRiskSignals, RiskSignal},
        scoped_vault::ScopedVault,
    },
    TxnPgConn,
};

use super::onboarding::{DecisionReasonCodes, OnboardingRulesDecisionOutput};
use crate::{
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::VaultWrapper,
};

/// Create our final decision from the features we created, set final onboarding status, and emit risk signals
/// assert_is_first_decision_for_onboarding determines if an error should be thrown if the onboarding already has a decision made
///     we set this true to perform this check during the initial decisioning we make at the end of Bifrost.
///     we also can make decisions post-Bifrost, when we manually trigger a running of decisioning and in those cases we would set this false
#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip(conn))]
pub fn save_final_decision(
    conn: &mut TxnPgConn,
    ob_id: OnboardingId,
    reason_codes: DecisionReasonCodes,
    verification_result_ids: Vec<VerificationResultId>,
    decision: &OnboardingRulesDecisionOutput,
    assert_is_first_decision_for_onboarding: bool,
    workflow_id: Option<WorkflowId>,
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<OnboardingDecision> {
    // TODO: Create our risk signals!
    // Save status
    let ob = Onboarding::lock(conn, &ob_id)?;
    let scoped_user = ScopedVault::get(conn, &ob.scoped_vault_id)?;

    let is_first_decision_for_onboarding = ob.decision_made_at.is_none();

    // prevent race conditions from producing 2 decisions
    if assert_is_first_decision_for_onboarding && !is_first_decision_for_onboarding {
        return Err(OnboardingError::OnboardingDecisionNotNeeded.into());
    }

    // If we should commit, portablize all data for the onboarding
    let seqno = if decision.decision.should_commit {
        let uvw = VaultWrapper::lock_for_onboarding(conn, &ob.scoped_vault_id)?;
        if uvw.vault.is_portable {
            let seqno = uvw.portablize_identity_data(conn)?;
            Some(seqno)
        } else {
            None
        }
    } else {
        None
    };

    // Create decision
    let onboarding_decision = OnboardingDecisionCreateArgs {
        vault_id: scoped_user.vault_id,
        onboarding: &ob,
        logic_git_hash: crate::GIT_HASH.to_string(),
        status: decision.decision.decision_status,
        result_ids: verification_result_ids,
        annotation_id: None,
        actor: DbActor::Footprint,
        seqno,
        workflow_id,
    };
    let obd = OnboardingDecision::create(conn, onboarding_decision)?;

    // Create ManualReview row if requested and an active one does not already exist
    if decision.decision.create_manual_review {
        let existing_review = ManualReview::get_active_for_onboarding(conn, &ob_id)?;
        if existing_review.is_none() {
            ManualReview::create(conn, ob_id, review_reasons)?;
        }
    }

    // Make a billable event here
    // If this is the first time setting a decision, then write decision_made_at
    if is_first_decision_for_onboarding {
        Onboarding::update(
            ob,
            conn,
            OnboardingUpdate::set_decision_and_decision_made_at(decision.decision.decision_status),
        )?;
    } else {
        Onboarding::update(
            ob,
            conn,
            OnboardingUpdate::set_decision(decision.decision.decision_status),
        )?;
    }

    RiskSignal::bulk_create(
        conn,
        NewRiskSignals::LegacyObd {
            onboarding_decision_id: obd.id.clone(),
            signals: reason_codes.into_iter().map(|r| (r.0, r.1)).collect(),
        },
    )?;
    Ok(obd)
}

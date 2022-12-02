use newtypes::{DbActor, DecisionStatus, OnboardingId};

use db::models::{
    manual_review::ManualReview,
    onboarding::Onboarding,
    onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
};

use super::features::*;
use crate::{
    errors::{onboarding::OnboardingError, ApiResult},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

/// Create our final decision from the features we created, set final onboarding status, and emit risk signals
pub async fn create_final_decision(
    state: &State,
    ob_id: OnboardingId,
    features: FeatureVector,
) -> ApiResult<()> {
    // TODO build process to run this asynchronously if we crashed before getting here
    // TODO: Create our risk signals!
    // Save status
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            Onboarding::lock(conn, &ob_id)?;
            let (current_ob, scoped_user, _, _) = Onboarding::get(conn, &ob_id)?;
            let decision = final_decision(&features, current_ob)?;

            // If the decision is a pass, mark all data as verified for the onboarding
            let seqno = if decision.decision_status == DecisionStatus::Pass {
                // TODO will this cause deadlock to lock onboarding AND uv?
                let uvw = UserVaultWrapper::lock_for_tenant(conn, &scoped_user.id)?;
                let seqno = uvw.commit_data_for_tenant(conn)?;
                Some(seqno)
            } else {
                None
            };

            // Create decision
            let onboarding_decision = OnboardingDecisionCreateArgs {
                user_vault_id: scoped_user.user_vault_id,
                onboarding_id: ob_id.clone(),
                logic_git_hash: crate::GIT_HASH.to_string(),
                status: decision.decision_status,
                result_ids: features.verification_results(),
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno,
            };
            OnboardingDecision::create(conn, onboarding_decision)?;

            // Create ManualReview row if requested
            if decision.create_manual_review {
                ManualReview::create(conn, ob_id)?;
            }

            // TODO: uncomment this shortly
            // Action decision, if applicable
            // action_decision(conn, decision)?;

            Ok(())
        })
        .await?;
    Ok(())
}

pub struct DecisionOutput {
    // TODO when the decision engine is more mature, make separate decisions on verification
    // status + compliance status
    // pub verification_status: VerificationStatus,
    // pub compliance_status: ComplianceStatus,
    pub decision_status: DecisionStatus,
    pub id_number: Option<u64>,
    pub onboarding_id: OnboardingId,
    pub create_manual_review: bool,
}
fn final_decision(features: &FeatureVector, current_onboarding: Onboarding) -> ApiResult<DecisionOutput> {
    let result_statuses: Vec<Option<DecisionStatus>> = features.statuses();
    // v0 Super basic logic
    //    1) If we need an ID doc for idology. OB status = Failed, verification status = NeedsIDDocument
    //    2) If we don't, fall back to `result_statuses`
    let idology_features = features.idology_features.to_owned();
    let maybe_id_doc_number = idology_features.and_then(|i| i.id_number_for_scan_required);

    let decision_status = if maybe_id_doc_number.is_some() {
        DecisionStatus::StepUpRequired
    } else {
        result_statuses
            .into_iter()
            .flatten()
            .min()
            // Should never end up in a situation with no decision
            .ok_or(OnboardingError::NoDecisionMade)?
    };

    let output = DecisionOutput {
        decision_status,
        id_number: maybe_id_doc_number,
        onboarding_id: current_onboarding.id,
        create_manual_review: features.create_manual_review(),
    };
    Ok(output)
}

// Based on our decision, do any necessary actions (creating Requirements, manual reviews, etc)
// fn action_decision(conn: &mut TxnPgConnection, decision_output: DecisionOutput) -> Result<(), DbError> {
//     if decision_output.verification_status == VerificationStatus::NeedsIDDocument {
//         DocumentRequest::create(conn, decision_output.onboarding_id, decision_output.id_number)?;
//     }

//     Ok(())
// }

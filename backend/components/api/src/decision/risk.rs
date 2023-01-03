use newtypes::{DbActor, DecisionStatus, OnboardingId};

use db::models::{
    manual_review::ManualReview,
    onboarding::{Onboarding, OnboardingUpdate},
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

            // prevent race conditions from producing 2 decisions
            if current_ob.has_final_decision {
                return Err(OnboardingError::OnboardingDecisionNotNeeded.into());
            }

            let decision = final_decision(&features, current_ob.id.clone())?;

            // If the decision is a pass, mark all data as verified for the onboarding
            let seqno = if decision.decision_status == DecisionStatus::Pass {
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
            let obd = OnboardingDecision::create(conn, onboarding_decision)?;

            // If we are done, we no longer need a decision
            if !obd.status.new_decision_required() {
                current_ob.update(conn, OnboardingUpdate::has_final_decision(true))?;
            }

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
fn final_decision(features: &FeatureVector, onboarding_id: OnboardingId) -> ApiResult<DecisionOutput> {
    // v0 Super basic logic
    //    1) If we need an ID doc for idology. OB status = Failed, verification status = NeedsIDDocument
    //    2) If we don't, fall back to `result_statuses`
    let idology_features = features.idology_features.to_owned();
    let maybe_id_doc_number = idology_features.and_then(|i| i.id_number_for_scan_required);

    let decision_status = if maybe_id_doc_number.is_some() {
        DecisionStatus::StepUpRequired
    } else {
        features
            .idology_features
            .as_ref()
            .map(|i| i.status)
            .ok_or(OnboardingError::NoDecisionMade)?
    };

    let create_manual_review = features
        .idology_features
        .as_ref()
        .map(|i| i.create_manual_review)
        .unwrap_or(false)
        || features
            .socure_features
            .as_ref()
            .map(|i| i.create_manual_review)
            .unwrap_or(false);

    let output = DecisionOutput {
        decision_status,
        id_number: maybe_id_doc_number,
        onboarding_id,
        create_manual_review,
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

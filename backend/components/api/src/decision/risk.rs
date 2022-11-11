use newtypes::{ComplianceStatus, OnboardingId, OnboardingStatus, VerificationStatus};

use db::models::{
    manual_review::ManualReview,
    onboarding::{Onboarding, OnboardingUpdate},
    onboarding_decision::{NewOnboardingDecision, OnboardingDecision},
};

use super::features::*;
use crate::{errors::ApiError, State};

/// Create our final decision from the features we created, set final onboarding status, and emit risk signals
pub async fn create_final_decision(
    state: &State,
    ob_id: OnboardingId,
    features: FeatureVector,
) -> Result<(), ApiError> {
    // TODO build process to run this asynchronously if we crashed before getting here
    // TODO: Create our risk signals!
    // Save status
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (current_ob, scoped_user, _) = Onboarding::get(conn, &ob_id)?;
            let current_status = current_ob.status;
            let decision = final_decision(&features, current_ob);
            if decision.onboarding_status != current_status {
                Onboarding::update_by_id(conn, &ob_id, OnboardingUpdate::status(decision.onboarding_status))?;
            }

            // Create decision
            let onboarding_decision = NewOnboardingDecision {
                user_vault_id: scoped_user.user_vault_id.clone(),
                onboarding_id: ob_id.clone(),
                logic_git_hash: crate::GIT_HASH.to_string(),
                tenant_user_id: None,
                verification_status: decision.verification_status,
                compliance_status: decision.compliance_status,
                result_ids: features.verification_results(),
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
    pub verification_status: VerificationStatus,
    pub compliance_status: ComplianceStatus,
    pub onboarding_status: OnboardingStatus,
    pub id_number: Option<u64>,
    pub onboarding_id: OnboardingId,
    pub create_manual_review: bool,
}
fn final_decision(features: &FeatureVector, current_onboarding: Onboarding) -> DecisionOutput {
    let result_statuses: Vec<Option<OnboardingStatus>> = features.statuses();
    // v0 Super basic logic
    //    1) If we need an ID doc for idology. OB status = Failed, verification status = NeedsIDDocument
    //    2) If we don't, fall back to `result_statuses`
    let idology_features = features.idology_features.to_owned();
    let maybe_id_doc_number = idology_features.and_then(|i| i.id_number_for_scan_required);

    let (verification_status, onboarding_status) = if maybe_id_doc_number.is_some() {
        (
            VerificationStatus::NeedsIdDocument,
            OnboardingStatus::StepUpRequired,
        )
    } else {
        let final_ob_status = result_statuses
            .into_iter()
            .flatten()
            .min()
            .unwrap_or(current_onboarding.status);

        (VerificationStatus::from(final_ob_status), final_ob_status)
    };

    DecisionOutput {
        verification_status,
        compliance_status: ComplianceStatus::default(),
        onboarding_status,
        id_number: maybe_id_doc_number,
        onboarding_id: current_onboarding.id,
        create_manual_review: features.create_manual_review(),
    }
}

// Based on our decision, do any necessary actions (creating Requirements, manual reviews, etc)
// fn action_decision(conn: &mut TxnPgConnection, decision_output: DecisionOutput) -> Result<(), DbError> {
//     if decision_output.verification_status == VerificationStatus::NeedsIDDocument {
//         DocumentRequest::create(conn, decision_output.onboarding_id, decision_output.id_number)?;
//     }

//     Ok(())
// }

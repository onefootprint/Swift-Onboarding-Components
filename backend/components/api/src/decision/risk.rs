use newtypes::{DbActor, DecisionStatus, OnboardingDecisionId, OnboardingId, TenantId, VendorAPI};

use db::{
    models::{
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::RiskSignal,
        scoped_user::ScopedUser,
    },
    TxnPgConnection,
};

use super::features::*;
use crate::feature_flag::FeatureFlagClient;
use crate::{
    errors::{onboarding::OnboardingError, ApiResult},
    feature_flag::LaunchDarklyFeatureFlagClient,
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

/// Create our final decision from the features we created, set final onboarding status, and emit risk signals
#[tracing::instrument(skip(state, features))]
pub async fn create_final_decision(
    state: &State,
    ob_id: OnboardingId,
    features: FeatureVector,
) -> ApiResult<()> {
    // TODO build process to run this asynchronously if we crashed before getting here
    // TODO: Create our risk signals!
    // Save status
    let feature_flag_client = state.feature_flag_client.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ob = Onboarding::lock(conn, &ob_id)?;
            let scoped_user = ScopedUser::get(conn, &ob.scoped_user_id)?;

            // prevent race conditions from producing 2 decisions
            if ob.has_final_decision {
                return Err(OnboardingError::OnboardingDecisionNotNeeded.into());
            }

            let decision = final_decision(&features, ob.id.clone())?;

            // If the decision is a pass, mark all data as verified for the onboarding
            let seqno = if decision.decision_status == DecisionStatus::Pass {
                let uvw = UserVaultWrapper::lock_for_onboarding(conn, &ob.scoped_user_id)?;
                let seqno = uvw.commit_identity_data(conn)?;
                Some(seqno)
            } else {
                None
            };

            // Create decision
            let onboarding_decision = OnboardingDecisionCreateArgs {
                user_vault_id: scoped_user.user_vault_id,
                onboarding: &ob,
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
                let ob = ob.into_inner();
                ob.update(conn, OnboardingUpdate::has_final_decision(true))?;
            }

            // Create ManualReview row if requested
            if decision.create_manual_review {
                ManualReview::create(conn, ob_id)?;
            }

            write_risk_signals(
                conn,
                &features,
                obd.id,
                &feature_flag_client,
                &scoped_user.tenant_id,
            )?;

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
    pub onboarding_id: OnboardingId,
    pub create_manual_review: bool,
}
fn final_decision(features: &FeatureVector, onboarding_id: OnboardingId) -> ApiResult<DecisionOutput> {
    // For now, we just take idology's decision
    let decision_status = features
        .idology_features
        .as_ref()
        .map(|i| i.status)
        .ok_or(OnboardingError::NoDecisionMade)?;

    // For now, we just queue up failures so we can see until we have a better sense of
    // what reviews we want to be doing
    let create_manual_review = decision_status == DecisionStatus::Fail;

    let output = DecisionOutput {
        decision_status,
        onboarding_id,
        create_manual_review,
    };
    Ok(output)
}

fn write_risk_signals(
    conn: &mut TxnPgConnection,
    feature_vector: &FeatureVector,
    onboarding_decision_id: OnboardingDecisionId,
    feature_flag_client: &LaunchDarklyFeatureFlagClient,
    tenant_id: &TenantId,
) -> ApiResult<()> {
    let mut vendor_apis = vec![
        VendorAPI::IdologyExpectID,
        VendorAPI::IdologyScanVerifySubmission,
        VendorAPI::IdologyScanVerifyResults,
        VendorAPI::IdologyScanOnboarding,
        VendorAPI::TwilioLookupV2,
    ];

    // For now, our Socure contract only allows Footprint to view or use Socure data
    if feature_flag_client
        .bool_flag_by_tenant_id("TenantCanViewSocureRiskSignal", tenant_id)
        .unwrap_or(false)
    {
        vendor_apis.push(VendorAPI::SocureIDPlus);
    }

    let reason_codes = feature_vector.consolidated_reason_codes(vendor_apis);
    RiskSignal::bulk_create(conn, onboarding_decision_id, reason_codes)?;
    Ok(())
}

// Based on our decision, do any necessary actions (creating Requirements, manual reviews, etc)
// fn action_decision(conn: &mut TxnPgConnection, decision_output: DecisionOutput) -> Result<(), DbError> {
//     if decision_output.verification_status == VerificationStatus::NeedsIDDocument {
//         DocumentRequest::create(conn, decision_output.onboarding_id, decision_output.id_number)?;
//     }

//     Ok(())
// }

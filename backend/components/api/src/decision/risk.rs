use newtypes::{AuditTrailEvent, OnboardingId, OnboardingStatus, Vendor, VerificationInfo};

use db::models::{
    audit_trail::AuditTrail,
    onboarding::{Onboarding, OnboardingUpdate},
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
    // TODO: for now, just take status
    // TODO: use more features!
    let result_statuses: Vec<Option<OnboardingStatus>> = features.statuses();
    // TODO: Create our risk signals!
    // Save status
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (current_ob, scoped_user) = Onboarding::get(conn, &ob_id)?;
            let current_status = current_ob.status;

            let final_status = result_statuses
                .into_iter()
                .flatten()
                .min()
                // default status to current status if we haven't computed new statuses. Previously we defaulted to Failed,
                // but this seems more sane?
                // See: https://github.com/onefootprint/monorepo/blob/a01e3b450f6338ccd7ced39565f5740372d45ce3/backend/components/api/src/decision/verification_request/make_request.rs#L98-L103
                .unwrap_or(current_status);

            if final_status != current_status {
                Onboarding::update_by_id(conn, &ob_id, OnboardingUpdate::status(final_status))?;
            }

            if let Some(status) = final_status.audit_status() {
                // TODO: create timeline
                AuditTrail::create(
                    conn,
                    AuditTrailEvent::Verification(VerificationInfo {
                        attributes: vec![],
                        vendor: Vendor::Footprint,
                        status,
                    }),
                    scoped_user.user_vault_id,
                    Some(scoped_user.tenant_id),
                    None,
                )?;
            }
            Ok(())
        })
        .await?;
    Ok(())
}

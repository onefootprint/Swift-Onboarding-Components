use db::{models::requirement::CreateRequirementConfig, PgConnection};
use newtypes::{
    AuditTrailEvent, OnboardingId, OnboardingStatus, RequirementKind, RequirementStatus2, Vendor,
    VerificationInfo,
};

use db::models::{
    audit_trail::AuditTrail,
    onboarding::{Onboarding, OnboardingUpdate},
};

use crate::{errors::ApiError, State};

/// Controls what additional requirements we may add during onboarding
pub(super) fn get_onboarding_step_up_requirement_kinds() -> Vec<CreateRequirementConfig> {
    // For now, the only "extra" requirement we have is liveness
    // Eventually, we'll do some risk-based computations here to add additional step ups
    vec![CreateRequirementConfig {
        kind: RequirementKind::Liveness,
        initiator: newtypes::RequirementInitiator::Footprint,
        fulfilled_at: None,
        fulfilled_by_requirement_id: None,
    }]
}

/// Determines whether we can move Requirement of kind RequirementKind to status RequirementStatus
pub(super) fn can_update_status_for_kind(
    _conn: &mut PgConnection,
    _status: RequirementStatus2,
    _kind: &RequirementKind,
) -> bool {
    true
}

pub async fn create_final_decision(
    state: &State,
    ob_id: OnboardingId,
    result_statuses: Vec<Option<OnboardingStatus>>,
) -> Result<(), ApiError> {
    // TODO build process to run this asynchronously if we crashed before getting here

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

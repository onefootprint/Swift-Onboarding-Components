use crate::{
    errors::{onboarding::OnboardingError, ApiError},
    utils::user_vault_wrapper::UserVaultWrapper,
};

use db::{
    models::{
        onboarding::{Onboarding, OnboardingUpdate},
        verification_request::VerificationRequest,
    },
    TxnPgConn,
};
use newtypes::OnboardingId;

pub(super) mod build_request;
pub mod make_request;
pub mod socure;
pub mod vendor_result;
pub mod vendor_trait;
pub mod verification_result;

/// Build verification requests from the UserVaultWrapper and save.
/// We save so that if something happens, we can always replay the requests
#[tracing::instrument(skip(conn, uvw))]
pub fn build_verification_requests_and_checkpoint(
    conn: &mut TxnPgConn,
    uvw: &UserVaultWrapper,
    ob_id: &OnboardingId,
) -> Result<Vec<VerificationRequest>, ApiError> {
    let ob = Onboarding::lock(conn, ob_id)?;
    // Can only initiate IDV reqs one time for an onboarding
    // Once we set idv_reqs_initiated_at below, this lock will make sure we can't save multiple sets of VerificationRequests
    // and multiple decisions for an onboarding in a race condition (suppose we call /submit twice by accident)
    if ob.idv_reqs_initiated_at.is_some() {
        // In the case of a step up (for similar race condition related reasons) we notate on the OB whether we _do_ need
        // to produce a new decision, despite not needing to initiate verification requests again.
        if ob.decision_made_at.is_none() {
            return Ok(vec![]);
        } else {
            return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
        }
    }
    // Always set the idv_reqs_initiated_at in order to checkpoint
    let ob = ob.into_inner();
    ob.update(conn, OnboardingUpdate::idv_reqs_initiated(true))?;
    // From the data in the vault, figure out which vendors we need to send to
    let vendor_apis =
        idv::requirements::available_vendor_apis(uvw.get_populated_identity_fields().as_slice());
    if vendor_apis.is_empty() {
        return Err(ApiError::AssertionError(
            "Not enough information to send to any vendors".into(),
        ));
    } // probably should add some more validations in the future, like make sure we are _at least_ sending to a KYC vendor

    let requests_to_initiate = VerificationRequest::bulk_create(conn, ob_id.clone(), vendor_apis)?;

    Ok(requests_to_initiate)
}

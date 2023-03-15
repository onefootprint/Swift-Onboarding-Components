use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    utils::vault_wrapper::{Person, VaultWrapper},
};

use db::{
    models::{
        onboarding::{Onboarding, OnboardingUpdate},
        verification_request::VerificationRequest,
    },
    TxnPgConn,
};
use newtypes::{OnboardingId, VendorAPI};

pub(super) mod build_request;
pub mod make_request;
pub mod vendor_result;
pub mod vendor_trait;
pub mod verification_result;

/// Build verification requests from the VaultWrapper and save.
/// We save so that if something happens, we can always replay the requests
#[tracing::instrument(skip(conn, uvw))]
pub fn build_verification_requests_and_checkpoint(
    conn: &mut TxnPgConn,
    uvw: &VaultWrapper<Person>,
    ob_id: &OnboardingId,
) -> Result<Vec<VerificationRequest>, ApiError> {
    // Once we set idv_reqs_initiated_at below, this lock will make sure we can't save multiple sets of VerificationRequests
    // and multiple decisions for an onboarding in a race condition (suppose we call /submit twice by accident)
    let ob = Onboarding::lock(conn, ob_id)?;

    if ob.idv_reqs_initiated_at.is_some() {
        return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
    }

    // Always set the idv_reqs_initiated_at in order to checkpoint
    let ob = ob.into_inner();
    let su_id = ob.scoped_user_id.clone();
    ob.update(conn, OnboardingUpdate::idv_reqs_initiated(true))?;

    let vendor_apis = desired_vendor_apis(uvw)?;

    let requests_to_initiate = VerificationRequest::bulk_create(conn, ob_id.clone(), su_id, vendor_apis)?;

    Ok(requests_to_initiate)
}

pub fn desired_vendor_apis(uvw: &VaultWrapper<Person>) -> ApiResult<Vec<VendorAPI>> {
    // From the data in the vault, figure out which vendors we need to send to
    let vendor_apis = idv::requirements::available_vendor_apis(uvw.populated().as_slice());
    if vendor_apis.is_empty() {
        return Err(ApiError::AssertionError(
            "Not enough information to send to any vendors".into(),
        ));
    } // probably should add some more validations in the future, like make sure we are _at least_ sending to a KYC vendor
    Ok(vendor_apis)
}

use crate::{
    errors::{onboarding::OnboardingError, ApiError},
    utils::user_vault_wrapper::UserVaultWrapper,
};

use db::{
    models::{
        onboarding::{Onboarding, OnboardingUpdate},
        verification_request::VerificationRequest,
    },
    TxnPgConnection,
};
use newtypes::{OnboardingId, VendorAPI};

use super::user_vault_helper;

pub(super) mod build_request;
pub(super) mod make_request;
pub mod vendor_result;
mod verification_result;

/// Build verification requests from the UserVaultWrapper and save.
/// We save so that if something happens, we can always replay the requests
pub fn build_verification_requests_and_checkpoint(
    conn: &mut TxnPgConnection,
    uvw: &UserVaultWrapper,
    ob_id: &OnboardingId,
) -> Result<Vec<VerificationRequest>, ApiError> {
    let ob = Onboarding::lock(conn, ob_id)?;
    // Can only initiate IDV reqs one time for an onboarding
    // Once we set idv_reqs_initiated below, this lock will make sure we can't save multiple sets of VerificationRequests
    // and multiple decisions for an onboarding in a race condition (suppose we call /submit twice by accident)
    if ob.idv_reqs_initiated {
        return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
    }
    // Always set the idv_reqs_initiated to true in order to checkpoint
    ob.update(conn, OnboardingUpdate::idv_reqs_initiated(true))?;
    // From the data in the vault, figure out which vendors we need to send to
    let available_vendor_apis = user_vault_helper::get_vendor_apis_from_user_vault_wrapper(uvw);
    // From the possible vendors, select which ones we're sending to (logic TBD)
    let vendor_apis = choose_vendor_apis(available_vendor_apis);
    let requests_to_initiate = VerificationRequest::bulk_create(conn, ob_id.clone(), vendor_apis)?;

    Ok(requests_to_initiate)
}

/// Placeholder for more dynamically choosing which APIs to route to based on available data
fn choose_vendor_apis(available_vendor_apis_from_vault_data: Vec<VendorAPI>) -> Vec<VendorAPI> {
    available_vendor_apis_from_vault_data
}

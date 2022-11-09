use crate::{errors::ApiError, utils::user_vault_wrapper::UserVaultWrapper};

use db::{
    models::{
        onboarding::{Onboarding, OnboardingUpdate},
        verification_request::VerificationRequest,
    },
    TxnPgConnection,
};
use newtypes::{OnboardingStatus, VendorAPI};

use super::user_vault_helper;

pub(super) mod build_request;
pub(super) mod make_request;

/// Build verification requests from the UserVaultWrapper and save.
/// We save so that if something happens, we can always replay the requests
pub fn build_verification_requests_and_checkpoint(
    conn: &mut TxnPgConnection,
    ob: Onboarding,
    uvw: &UserVaultWrapper,
) -> Result<Vec<VerificationRequest>, ApiError> {
    // Always set the onboarding to Processing to checkpoint progress here
    let ob = ob.update(conn, OnboardingUpdate::status(OnboardingStatus::Processing))?;
    // From the data in the vault, figure out which vendors we need to send to
    let available_vendor_apis = user_vault_helper::get_vendor_apis_from_user_vault_wrapper(uvw);
    // From the possible vendors, select which ones we're sending to (logic TBD)
    let vendor_apis = choose_vendor_apis(available_vendor_apis);

    let requests_to_save = vendor_apis
        .into_iter()
        .map(|v| build_request::build_verification_request(uvw, ob.id.clone(), v))
        .collect();
    let requests_to_initiate = VerificationRequest::bulk_save(conn, requests_to_save)?;

    Ok(requests_to_initiate)
}

/// Placeholder for more dynamically choosing which APIs to route to based on available data
fn choose_vendor_apis(available_vendor_apis_from_vault_data: Vec<VendorAPI>) -> Vec<VendorAPI> {
    available_vendor_apis_from_vault_data
}

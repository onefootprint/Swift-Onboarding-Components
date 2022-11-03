use crate::{errors::ApiError, utils::user_vault_wrapper::UserVaultWrapper};

use db::{
    models::{
        onboarding::{Onboarding, OnboardingUpdate},
        verification_request::VerificationRequest,
    },
    TxnPgConnection,
};
use newtypes::{OnboardingStatus, TenantId, VendorAPI};

use super::{user_vault_helper, utils};

pub(super) mod build_request;
pub(super) mod make_request;

/// Build verification requests from the UserVaultWrapper and save.
/// We save so that if something happens, we can always replay the requests
pub fn build_verification_requests_and_checkpoint(
    conn: &mut TxnPgConnection,
    ob: Onboarding,
    uvw: &UserVaultWrapper,
    tenant_id: &TenantId,
    desired_status: Option<OnboardingStatus>,
) -> Result<Vec<VerificationRequest>, ApiError> {
    let ob = ob.update(conn, OnboardingUpdate::status(OnboardingStatus::Processing))?;
    // From the data in the vault, figure out which vendors we need to send to
    let available_vendor_apis = user_vault_helper::get_vendor_apis_from_user_vault_wrapper(uvw);
    // From the possible vendors, select which ones we're sending to (logic TBD)
    let vendor_apis = choose_vendor_apis(available_vendor_apis);

    // In the case we have a desired status, we are testing
    // TODO: As of 2022-11-03 in all cases we will set desired status (for prod demos). This will be revisited
    // See https://www.notion.so/onefootprint/Onboarding-Status-5c334a8ff13948e6a12646037853d120
    let requests_to_initiate = if let Some(desired_status) = desired_status {
        // let ob = ob.update(conn, OnboardingUpdate::status(desired_status))?;
        // If we're not kicking off a verification, just create some fixture events for now
        // Don't make duplicate fixture events if the user onboards multiple times since it
        // isn't very self-explanatory for the demo
        // TODO kick off user verification with data vendors,
        // and don't mark as verified until data verification with vendors is complete
        utils::create_test_fixture_data(conn, uvw, tenant_id.clone(), ob.id, desired_status)?;
        vec![]
    } else {
        // In the case we do not have a desired status, we are Processing the onboarding since we are kicking off VReqs

        // Create real VerificationRequests because we are kicking off IDV verification
        let requests_to_save = vendor_apis
            .into_iter()
            .map(|v| build_request::build_verification_request(uvw, ob.id.clone(), v))
            .collect();
        VerificationRequest::bulk_save(conn, requests_to_save)?
    };

    Ok(requests_to_initiate)
}

/// Placeholder for more dynamically choosing which APIs to route to based on available data
fn choose_vendor_apis(available_vendor_apis_from_vault_data: Vec<VendorAPI>) -> Vec<VendorAPI> {
    available_vendor_apis_from_vault_data
}

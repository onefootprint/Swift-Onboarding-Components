use crate::{errors::ApiError, utils::user_vault_wrapper::UserVaultWrapper};

use db::{
    models::{
        onboarding::{Onboarding, OnboardingUpdate},
        verification_request::VerificationRequest,
    },
    TxnPgConnection,
};
use newtypes::{OnboardingStatus, TenantId, Vendor};

use super::utils;

pub(super) mod build_request;
pub(super) mod make_request;

/// Build verification requests from the UserVaultWrapper and save.
/// We save so that if something happens, we can always replay the requests
pub fn build_verification_requests_and_checkpoint(
    conn: &mut TxnPgConnection,
    ob: Onboarding,
    uvw: &UserVaultWrapper,
    tenant_id: &TenantId,
    desired_status: OnboardingStatus,
    vendors: Vec<Vendor>,
) -> Result<Vec<VerificationRequest>, ApiError> {
    // TODO decide when to re-KYC
    // Create the VerificationRequest and mark the onboarding's kyc_status
    let ob = ob.update(conn, OnboardingUpdate::status(desired_status))?;

    let requests = if desired_status == OnboardingStatus::Processing {
        let requests_to_initiate = vendors
            .into_iter()
            .map(|v| build_request::build_verification_request(uvw, ob.id.clone(), v))
            .collect();
        VerificationRequest::bulk_save(conn, requests_to_initiate)?
    } else {
        // If we're not kicking off a verification, just create some fixture events for now
        // Don't make duplicate fixture events if the user onboards multiple times since it
        // isn't very self-explanatory for the demo
        // TODO kick off user verification with data vendors,
        // and don't mark as verified until data verification with vendors is complete
        utils::create_test_fixture_data(
            conn,
            uvw.user_vault.id.clone(),
            tenant_id.clone(),
            ob.id,
            desired_status,
        )?;
        vec![]
    };
    Ok(requests)
}

use crate::{
    errors::{ApiError, ApiResult},
    utils::vault_wrapper::{Person, VaultWrapper},
};

use db::{models::verification_request::VerificationRequest, TxnPgConn};
use newtypes::{OnboardingId, ScopedVaultId, VendorAPI};

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
    su_id: &ScopedVaultId,
) -> Result<Vec<VerificationRequest>, ApiError> {
    let vendor_apis = desired_vendor_apis(uvw)?;

    let requests_to_initiate = VerificationRequest::bulk_create(conn, su_id.clone(), vendor_apis)?;

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

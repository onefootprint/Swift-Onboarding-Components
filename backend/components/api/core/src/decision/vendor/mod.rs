use std::fmt::Display;

use crate::{
    errors::{ApiError, ApiErrorKind, ApiResult},
    utils::vault_wrapper::VaultWrapper,
};

use db::{models::verification_request::VerificationRequest, TxnPgConn};
use newtypes::{DecisionIntentId, IdentityDataKind, ScopedVaultId, VendorAPI};

use self::tenant_vendor_control::TenantVendorControl;

pub mod build_request;
pub mod fp_device_attestation;
pub mod incode;
pub mod incode_watchlist;
pub mod kyc;
pub mod make_request;
pub mod middesk;
pub mod tenant_vendor_control;
pub mod vendor_api;
pub mod vendor_result;
pub mod vendor_trait;
pub mod verification_result;

/// Build verification requests from the VaultWrapper and save.
/// We save so that if something happens, we can always replay the requests
#[tracing::instrument(skip(conn, uvw))]
pub fn build_verification_requests_and_checkpoint(
    conn: &mut TxnPgConn,
    uvw: &VaultWrapper,
    su_id: &ScopedVaultId,
    decision_intent_id: &DecisionIntentId,
    tenant_vendor_control: &TenantVendorControl,
    vendor_apis: Vec<VendorAPI>,
) -> Result<Vec<VerificationRequest>, ApiError> {
    let mut available_vendor_apis =
        get_vendor_apis_for_verification_requests(uvw.populated().as_slice(), tenant_vendor_control)?;
    available_vendor_apis.retain(|v| vendor_apis.contains(v));

    let requests_to_initiate =
        VerificationRequest::bulk_create(conn, su_id.clone(), available_vendor_apis, decision_intent_id)?;

    Ok(requests_to_initiate)
}

pub fn get_vendor_apis_for_verification_requests(
    present_data_lifetime_kinds: &[IdentityDataKind],
    tenant_vendor_control: &TenantVendorControl,
) -> ApiResult<Vec<VendorAPI>> {
    // From the data in the vault, figure out which vendors we _can_ send to
    let vendor_apis = idv::requirements::available_vendor_apis(present_data_lifetime_kinds)
        .into_iter()
        // filter available vendor apis by whether or not this vendor is enabled for a tenant
        .filter(|v| tenant_vendor_control.enabled_vendor_apis().contains(v))
        .collect::<Vec<_>>();
    if vendor_apis.is_empty() {
        Err(ApiErrorKind::AssertionError(
            "Not enough information to send to any vendors".into(),
        ))?;
    } // probably should add some more validations in the future, like make sure we are _at least_ sending to a KYC vendor
    Ok(vendor_apis)
}

#[derive(Debug)]
pub struct VendorAPIError {
    pub vendor_api: VendorAPI,
    pub error: idv::Error,
}

impl Display for VendorAPIError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.error)
    }
}

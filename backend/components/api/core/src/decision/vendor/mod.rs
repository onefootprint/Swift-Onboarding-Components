use self::tenant_vendor_control::TenantVendorControl;
use crate::errors::{
    ApiErrorKind,
    ApiResult,
};
use crate::ApiError;
use newtypes::{
    DecisionIntentId,
    IdentityDataKind,
    ScopedVaultId,
    VendorAPI,
};
use std::fmt::Display;

pub mod build_request;
pub mod fp_device_attestation;
pub mod incode;
pub mod kyc;
pub mod make_request;
pub mod middesk;
pub mod neuro_id;
pub mod tenant_vendor_control;
pub mod vendor_api;
pub mod vendor_result;
pub mod vendor_trait;
pub mod verification_result;

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
    } // probably should add some more validations in the future, like make sure we are _at least_ sending
      // to a KYC vendor
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

pub fn map_to_api_error<E: Into<idv::Error>>(e: E) -> ApiError {
    ApiError::from(e.into())
}

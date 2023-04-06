use crate::{
    errors::{ApiError, ApiResult},
    utils::vault_wrapper::{Person, VaultWrapper},
};

use db::{
    models::{tenant::Tenant, verification_request::VerificationRequest},
    TxnPgConn,
};
use newtypes::{DecisionIntentId, IdentityDataKind, OnboardingId, ScopedVaultId, VendorAPI};

pub mod build_request;
pub mod idv_request;
pub mod make_request;
pub mod tenant_vendor_control;
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
    decision_intent_id: &DecisionIntentId,
) -> Result<Vec<VerificationRequest>, ApiError> {
    let tenant = Tenant::get(conn, su_id)?;

    let vendor_apis = get_vendor_apis_for_verification_requests(uvw.populated().as_slice(), &tenant)?;

    let requests_to_initiate =
        VerificationRequest::bulk_create(conn, su_id.clone(), vendor_apis, decision_intent_id)?;

    Ok(requests_to_initiate)
}

pub fn get_vendor_apis_for_verification_requests(
    present_data_lifetime_kinds: &[IdentityDataKind],
    tenant: &Tenant,
) -> ApiResult<Vec<VendorAPI>> {
    // From the data in the vault, figure out which vendors we _can_ send to
    let vendor_apis = idv::requirements::available_vendor_apis(present_data_lifetime_kinds)
        .into_iter()
        // filter available vendor apis by whether or not this vendor is enabled for a tenant
        .filter(|v| is_vendor_api_enabled_for_tenant(v, tenant))
        .collect::<Vec<_>>();

    if vendor_apis.is_empty() {
        return Err(ApiError::AssertionError(
            "Not enough information to send to any vendors".into(),
        ));
    } // probably should add some more validations in the future, like make sure we are _at least_ sending to a KYC vendor
    Ok(vendor_apis)
}

fn is_vendor_api_enabled_for_tenant(vendor_api: &VendorAPI, tenant: &Tenant) -> bool {
    match vendor_api {
        VendorAPI::IdologyExpectID => true,
        VendorAPI::IdologyScanVerifySubmission => true,
        VendorAPI::IdologyScanVerifyResults => true,
        VendorAPI::IdologyScanOnboarding => true,
        VendorAPI::IdologyPa => true,
        VendorAPI::TwilioLookupV2 => true,
        VendorAPI::SocureIDPlus => true,
        VendorAPI::ExperianPreciseID => tenant.is_experian_enabled,
        VendorAPI::MiddeskCreateBusiness => true,
    }
}

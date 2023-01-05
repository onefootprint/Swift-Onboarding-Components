use crate::utils::user_vault_wrapper::UserVaultWrapper;

use db::HasDataAttributeFields;
use idv::socure;
use newtypes::{DataLifetimeKind, VendorAPI};

use itertools::Itertools;

/// Based on what is present in the uservault, determine which requests we can make
pub(super) fn get_vendor_apis_from_user_vault_wrapper(
    user_vault_wrapper: &UserVaultWrapper,
) -> Vec<VendorAPI> {
    let attributes_available = user_vault_wrapper.get_populated_fields();

    let mut vendor_apis: Vec<VendorAPI> = attributes_available
        .clone()
        .into_iter()
        .flat_map(available_vendor_api_from_scope)
        .unique()
        .collect();

    if socure::requirements::meets_requirements_for_idplus_request(&attributes_available) {
        vendor_apis.push(VendorAPI::SocureIDPlus);
    }

    vendor_apis
}

fn available_vendor_api_from_scope(attribute: DataLifetimeKind) -> Vec<VendorAPI> {
    match attribute {
        DataLifetimeKind::FirstName => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::LastName => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::Dob => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::Ssn9 => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::Ssn4 => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::AddressLine1 => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::AddressLine2 => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::City => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::State => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::Zip => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::Country => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::Email => vec![VendorAPI::IdologyExpectID],
        DataLifetimeKind::PhoneNumber => vec![VendorAPI::TwilioLookupV2],
        DataLifetimeKind::IdentityDocument => vec![VendorAPI::IdologyScanVerify],
    }
}

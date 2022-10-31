use crate::{errors::ApiResult, utils::user_vault_wrapper::UserVaultWrapper};

use db::HasDataAttributeFields;
use newtypes::{DataAttribute, VendorAPI};

use itertools::Itertools;

/// Based on what is present in the uservault, determine which requests we can make
pub(super) fn get_vendor_apis_from_user_vault_wrapper(
    user_vault_wrapper: &UserVaultWrapper,
) -> ApiResult<Vec<VendorAPI>> {
    let scopes_available = user_vault_wrapper.get_populated_fields();

    let apis: Vec<VendorAPI> = scopes_available
        .into_iter()
        .flat_map(available_vendor_api_from_scope)
        .unique()
        .collect();

    Ok(apis)
}

fn available_vendor_api_from_scope(attribute: DataAttribute) -> Vec<VendorAPI> {
    match attribute {
        DataAttribute::FirstName => vec![VendorAPI::IdologyExpectID],
        DataAttribute::LastName => vec![VendorAPI::IdologyExpectID],
        DataAttribute::Dob => vec![VendorAPI::IdologyExpectID],
        DataAttribute::Ssn9 => vec![VendorAPI::IdologyExpectID],
        DataAttribute::Ssn4 => vec![VendorAPI::IdologyExpectID],
        DataAttribute::AddressLine1 => vec![VendorAPI::IdologyExpectID],
        DataAttribute::AddressLine2 => vec![VendorAPI::IdologyExpectID],
        DataAttribute::City => vec![VendorAPI::IdologyExpectID],
        DataAttribute::State => vec![VendorAPI::IdologyExpectID],
        DataAttribute::Zip => vec![VendorAPI::IdologyExpectID],
        DataAttribute::Country => vec![VendorAPI::IdologyExpectID],
        DataAttribute::Email => vec![VendorAPI::IdologyExpectID],
        DataAttribute::PhoneNumber => vec![VendorAPI::TwilioLookupV2],
        DataAttribute::IdentityDocument => vec![VendorAPI::IdologyScanVerify],
    }
}

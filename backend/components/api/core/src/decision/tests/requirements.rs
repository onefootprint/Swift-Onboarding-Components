// use db::models::tenant::Tenant;
use db::tests::fixtures;
use db::tests::prelude::*;
use macros::db_test_case;
use newtypes::IdentityDataKind;
use newtypes::VendorAPI;

use crate::decision::vendor::get_vendor_apis_for_verification_requests;

#[db_test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
    IdentityDataKind::AddressLine1,
    IdentityDataKind::Zip,
    IdentityDataKind::State,
    IdentityDataKind::Country,
    IdentityDataKind::City,
], false => vec![VendorAPI::IdologyExpectID, VendorAPI::SocureIDPlus])]
#[db_test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
    IdentityDataKind::AddressLine1,
    IdentityDataKind::Zip,
    IdentityDataKind::State,
    IdentityDataKind::Country,
    IdentityDataKind::City,
], true => vec![VendorAPI::IdologyExpectID, VendorAPI::SocureIDPlus, VendorAPI::ExperianPreciseID])]
// not enough info for experian, but tenant is xpn enabled
#[db_test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
] , true => vec![VendorAPI::SocureIDPlus])]
fn test_get_vendor_apis_for_verification_requests(
    conn: &mut TestPgConn,
    data_lifetime_kinds: Vec<IdentityDataKind>,
    tenant_is_experian_enabled: bool,
) -> Vec<VendorAPI> {
    let mut tenant = fixtures::tenant::create(conn);

    tenant.is_experian_enabled = tenant_is_experian_enabled;

    get_vendor_apis_for_verification_requests(data_lifetime_kinds.as_slice(), &tenant).unwrap()
}

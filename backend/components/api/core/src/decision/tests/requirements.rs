use crate::decision::vendor::get_vendor_apis_for_verification_requests;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::State;
use db::models::tenant::Tenant;
use db::tests::fixtures;
use newtypes::{
    IdentityDataKind,
    Vendor,
    VendorAPI,
};
use strum::IntoEnumIterator;
use test_case::test_case;

async fn create_tvc_for_requirements(
    state: &State,
    vendor_control_exists_and_has_vendors_enabled: Option<Vec<Vendor>>,
    tenant: Tenant,
) -> TenantVendorControl {
    let db_tenant_vendor_control = vendor_control_exists_and_has_vendors_enabled.map(|vendors| {
        let (experian_enabled, sub_code) = if vendors.contains(&Vendor::Experian) {
            (true, Some("sub_code".into()))
        } else {
            (false, None)
        };

        let idology_enabled = vendors.contains(&Vendor::Idology);

        fixtures::tenant_vendor_control::create_in_memory(
            tenant.id.clone(),
            idology_enabled,
            experian_enabled,
            sub_code,
        )
    });

    crate::decision::tests::tenant_vendor_control::fixtures::create(state, db_tenant_vendor_control, tenant)
        .await
}

#[test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
    IdentityDataKind::AddressLine1,
    IdentityDataKind::Zip,
    IdentityDataKind::State,
    IdentityDataKind::Country,
    IdentityDataKind::City,
], Some(vec![Vendor::Idology]) => vec![VendorAPI::IdologyExpectId])]
#[test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
    IdentityDataKind::AddressLine1,
    IdentityDataKind::Zip,
    IdentityDataKind::State,
    IdentityDataKind::Country,
    IdentityDataKind::City,
], None => vec![VendorAPI::IdologyExpectId])]
#[test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
    IdentityDataKind::AddressLine1,
    IdentityDataKind::Zip,
    IdentityDataKind::State,
    IdentityDataKind::Country,
    IdentityDataKind::City,
    IdentityDataKind::PhoneNumber,
    IdentityDataKind::Ssn9,
    IdentityDataKind::Ssn4,
], Some(vec![Vendor::Idology, Vendor::Experian]) => vec![VendorAPI::IdologyExpectId, VendorAPI::ExperianPreciseId])]
#[test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
    IdentityDataKind::AddressLine1,
    IdentityDataKind::Zip,
    IdentityDataKind::State,
    IdentityDataKind::Country,
    IdentityDataKind::City,
    IdentityDataKind::PhoneNumber,
    IdentityDataKind::Ssn9,
    IdentityDataKind::Ssn4,
], None => vec![VendorAPI::IdologyExpectId]; "no tenant vendor control means no experian")]
// not enough info for experian, but tenant is xpn enabled
#[test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
    IdentityDataKind::AddressLine1,
] , Some(vec![Vendor::Idology, Vendor::Experian]) => vec![VendorAPI::IdologyExpectId])]
#[test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
    IdentityDataKind::AddressLine1,
] , None => vec![VendorAPI::IdologyExpectId])]
// Catch all case for vendors we expect if we had a full vault
#[test_case(
    IdentityDataKind::iter().collect()
, None => vec![VendorAPI::IdologyExpectId])]
// Catch all case for vendors we expect if we had a full vault and TVC
#[test_case(
    IdentityDataKind::iter().collect()
, Some(vec![Vendor::Idology, Vendor::Experian]) => vec![VendorAPI::IdologyExpectId, VendorAPI::ExperianPreciseId])]
#[tokio::test]
async fn test_get_vendor_apis_for_verification_requests(
    data_lifetime_kinds: Vec<IdentityDataKind>,
    tenant_vendor_control_exists_and_has_vendors_enabled: Option<Vec<Vendor>>,
) -> Vec<VendorAPI> {
    let state = &State::test_state().await;

    let (pub_key, e_priv_key) = state.enclave_client.generate_sealed_keypair().await.unwrap();
    let tenant = db::tests::fixtures::tenant::create_in_memory(pub_key, e_priv_key);
    let tenant_vendor_control = create_tvc_for_requirements(
        state,
        tenant_vendor_control_exists_and_has_vendors_enabled,
        tenant,
    )
    .await;

    get_vendor_apis_for_verification_requests(data_lifetime_kinds.as_slice(), &tenant_vendor_control).unwrap()
}

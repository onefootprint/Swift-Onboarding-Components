use db::models::tenant::Tenant;
use db::tests::fixtures;
use newtypes::IdentityDataKind;
use newtypes::Vendor;
use newtypes::VendorAPI;
use strum::IntoEnumIterator;
use test_case::test_case;

use crate::decision::vendor::get_vendor_apis_for_verification_requests;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::utils::mock_enclave::StateWithMockEnclave;
use crate::State;

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

        let (idology_enabled, idology_username, idology_e_password) = if vendors.contains(&Vendor::Idology) {
            (
                true,
                Some("un".into()),
                Some(tenant.public_key.seal_pii(&"pw".to_string().into()).unwrap()),
            )
        } else {
            (false, None, None)
        };

        fixtures::tenant_vendor_control::create_in_memory(
            tenant.id,
            idology_enabled,
            idology_username,
            idology_e_password,
            experian_enabled,
            sub_code,
        )
    });

    crate::decision::tests::tenant_vendor_control::fixtures::create(
        state,
        db_tenant_vendor_control,
        tenant.e_private_key,
    )
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
], Some(vec![Vendor::Idology]) => vec![VendorAPI::IdologyExpectID, VendorAPI::SocureIDPlus])]
#[test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
    IdentityDataKind::AddressLine1,
    IdentityDataKind::Zip,
    IdentityDataKind::State,
    IdentityDataKind::Country,
    IdentityDataKind::City,
], None => vec![VendorAPI::IdologyExpectID, VendorAPI::SocureIDPlus])]
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
], Some(vec![Vendor::Idology, Vendor::Experian]) => vec![VendorAPI::IdologyExpectID, VendorAPI::TwilioLookupV2, VendorAPI::SocureIDPlus, VendorAPI::ExperianPreciseID])]
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
], None => vec![VendorAPI::IdologyExpectID, VendorAPI::TwilioLookupV2, VendorAPI::SocureIDPlus]; "no tenant vendor control means no experian")]
// not enough info for experian, but tenant is xpn enabled
#[test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
] , Some(vec![Vendor::Idology, Vendor::Experian]) => vec![VendorAPI::SocureIDPlus])]
#[test_case(vec![
    IdentityDataKind::FirstName,
    IdentityDataKind::LastName,
] , None => vec![VendorAPI::SocureIDPlus])]
// Catch all case for vendors we expect if we had a full vault
#[test_case(
    IdentityDataKind::iter().collect()
, None => vec![VendorAPI::IdologyExpectID, VendorAPI::TwilioLookupV2, VendorAPI::SocureIDPlus])]
// Catch all case for vendors we expect if we had a full vault and TVC
#[test_case(
    IdentityDataKind::iter().collect()
, Some(vec![Vendor::Idology, Vendor::Experian]) => vec![VendorAPI::IdologyExpectID, VendorAPI::TwilioLookupV2, VendorAPI::SocureIDPlus, VendorAPI::ExperianPreciseID])]
#[tokio::test]
async fn test_get_vendor_apis_for_verification_requests(
    data_lifetime_kinds: Vec<IdentityDataKind>,
    tenant_vendor_control_exists_and_has_vendors_enabled: Option<Vec<Vendor>>,
) -> Vec<VendorAPI> {
    let state = &StateWithMockEnclave::init().await.state;
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

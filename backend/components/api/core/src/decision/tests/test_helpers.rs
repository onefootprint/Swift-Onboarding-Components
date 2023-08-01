use db::{
    models::{
        contact_info::ContactInfo, ob_configuration::ObConfiguration, onboarding::Onboarding,
        scoped_vault::ScopedVault, tenant::Tenant, vault::Vault,
    },
    tests::fixtures,
    DbError, DbPool, TxnPgConn,
};
use newtypes::{
    CipKind, CollectedDataOption, DataIdentifier, IdentityDataKind, PiiString, VaultKind,
    WorkflowFixtureResult,
};

use crate::{
    enclave_client::EnclaveClient,
    tests::fixtures::lib::random_phone_number,
    utils::vault_wrapper::{Any, VaultWrapper},
};

pub async fn create_user_and_onboarding(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    must_collect_data: Option<Vec<CollectedDataOption>>,
    cip_kind: Option<CipKind>,
    is_live: bool,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Tenant, Onboarding, Vault, ScopedVault, ObConfiguration) {
    let (pk, tenant_e_key) = enclave_client.generate_sealed_keypair().await.unwrap();
    db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let tenant = fixtures::tenant::create_with_keys(conn, pk, tenant_e_key);
            let ob_config = fixtures::ob_configuration::create_with_opts(
                conn,
                &tenant.id,
                is_live,
                must_collect_data,
                cip_kind,
            );
            let ob_config_id = ob_config.id.clone();

            let (uv, su) = create_user_and_populate_vault(conn, ob_config.clone(), fixture_result);

            let onboarding = fixtures::onboarding::create(conn, su.id.clone(), ob_config_id, fixture_result);

            Ok((tenant, onboarding, uv, su, ob_config))
        })
        .await
        .unwrap()
}

pub fn create_user_and_populate_vault(
    conn: &mut TxnPgConn,
    ob_config: ObConfiguration,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Vault, ScopedVault) {
    let sandbox_id = fixture_result.map(|f| format!("{}_sandbox", f));
    let uv = fixtures::vault::create(conn, VaultKind::Person, sandbox_id, true);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let update = vec![
        (
            IdentityDataKind::PhoneNumber.into(),
            PiiString::new(random_phone_number()),
        ),
        (
            IdentityDataKind::FirstName.into(),
            PiiString::new("Bob".to_owned()),
        ),
        (
            IdentityDataKind::LastName.into(),
            PiiString::new("Boberto".to_owned()),
        ),
        (
            IdentityDataKind::AddressLine1.into(),
            PiiString::new("123 Bob St.".to_owned()),
        ),
        (
            IdentityDataKind::AddressLine2.into(),
            PiiString::new("#33".to_owned()),
        ),
        (
            IdentityDataKind::City.into(),
            PiiString::new("Bobville".to_owned()),
        ),
        (
            IdentityDataKind::Dob.into(),
            PiiString::new("1990-01-01".to_owned()),
        ),
        (IdentityDataKind::State.into(), PiiString::new("GA".to_owned())),
        (IdentityDataKind::Zip.into(), PiiString::new("30303".to_owned())),
        (IdentityDataKind::Country.into(), PiiString::new("US".to_owned())),
    ];

    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id).unwrap();
    let new_ci = uvw.patch_data_test(conn, update, false).unwrap();
    let (_, ci) = new_ci
        .into_iter()
        .find(|(di, _)| di == &DataIdentifier::from(IdentityDataKind::PhoneNumber))
        .unwrap();
    ContactInfo::mark_verified(conn, &ci.id).unwrap();

    (uv.into_inner(), su)
}

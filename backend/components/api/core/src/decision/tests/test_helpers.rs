use db::{
    models::{
        contact_info::ContactInfo, decision_intent::DecisionIntent, ob_configuration::ObConfiguration,
        onboarding::Onboarding, scoped_vault::ScopedVault, tenant::Tenant, vault::Vault,
    },
    tests::fixtures,
    DbError, DbPool, TxnPgConn,
};
use newtypes::{CipKind, CollectedDataOption, DataIdentifier, IdentityDataKind, PiiString, VaultKind};

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
    phone_suffix: Option<String>,
) -> (
    Tenant,
    Onboarding,
    Vault,
    ScopedVault,
    DecisionIntent,
    ObConfiguration,
) {
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

            let (uv, su) = create_user_and_populate_vault(conn, ob_config.clone(), phone_suffix);

            let onboarding = fixtures::onboarding::create(conn, su.id.clone(), ob_config_id);

            // TODO: should probably not have this create a DI by default here. Workflows will create their own DI so for test cases running WF's, we should rely on that.
            // For other use cases that need to artificially make a DI, we should probably do that separately in another method
            let decision_intent =
                DecisionIntent::get_or_create_onboarding_kyc(conn, &onboarding.scoped_vault_id).unwrap();

            Ok((tenant, onboarding, uv, su, decision_intent, ob_config))
        })
        .await
        .unwrap()
}

pub fn create_user_and_populate_vault(
    conn: &mut TxnPgConn,
    ob_config: ObConfiguration,
    sandbox_id: Option<String>,
) -> (Vault, ScopedVault) {
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

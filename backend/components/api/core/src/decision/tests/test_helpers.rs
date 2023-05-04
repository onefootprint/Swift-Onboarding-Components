use db::{
    models::{
        decision_intent::DecisionIntent, ob_configuration::ObConfiguration, onboarding::Onboarding,
        scoped_vault::ScopedVault, tenant::Tenant, vault::Vault,
    },
    tests::fixtures,
    DbError, DbPool, TxnPgConn,
};
use newtypes::{IdentityDataKind, PiiString, VendorAPI};

use crate::{
    enclave_client::EnclaveClient,
    tests::fixtures::lib::random_phone_number,
    utils::vault_wrapper::{Any, VaultWrapper},
};

pub async fn create_user_and_onboarding(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
) -> (Tenant, Onboarding, Vault, ScopedVault, DecisionIntent) {
    let (pk, tenant_e_key) = enclave_client.generate_sealed_keypair().await.unwrap();
    db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let tenant = fixtures::tenant::create_with_keys(conn, pk, tenant_e_key);
            let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
            let ob_config_id = ob_config.id.clone();

            let (uv, su) = create_user_and_populate_vault(conn, ob_config);

            let onboarding = fixtures::onboarding::create(conn, su.id.clone(), ob_config_id);

            let decision_intent =
                DecisionIntent::get_or_create_onboarding_kyc(conn, &onboarding.scoped_vault_id).unwrap();

            fixtures::verification_request::bulk_create(
                conn,
                &onboarding.scoped_vault_id,
                vec![
                    VendorAPI::TwilioLookupV2,
                    VendorAPI::IdologyExpectID,
                    VendorAPI::SocureIDPlus,
                    VendorAPI::ExperianPreciseID,
                ],
                &decision_intent.id,
            );

            Ok((tenant, onboarding, uv, su, decision_intent))
        })
        .await
        .unwrap()
}

pub fn create_user_and_populate_vault(
    conn: &mut TxnPgConn,
    ob_config: ObConfiguration,
) -> (Vault, ScopedVault) {
    let uv = fixtures::vault::create_person(conn, ob_config.is_live);
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
    ];

    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.patch_data_test(conn, update).unwrap();

    (uv.into_inner(), su)
}

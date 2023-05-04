use db::{
    models::tenant_vendor::TenantVendorControl as DbTenantVendorControl, tests::test_db_pool::TestDbPool,
};
use macros::test_db_pool;
use newtypes::{
    vendor_credentials::{ExperianCredentialBuilder, ExperianCredentials, IdologyCredentials},
    EncryptedVaultPrivateKey, SealedVaultBytes, TenantId, VaultPublicKey,
};

use crate::{
    config::Config, decision::vendor::tenant_vendor_control::TenantVendorControl,
    enclave_client::EnclaveClient, utils::mock_enclave::StateWithMockEnclave,
};

#[allow(clippy::too_many_arguments)]
async fn create_db_vendor_control(
    db_pool: &TestDbPool,
    public_key: VaultPublicKey,
    e_private_key: EncryptedVaultPrivateKey,
    idology_enabled: bool,
    idology_username: Option<String>,
    idology_e_password: Option<SealedVaultBytes>,
    experian_enabled: bool,
    experian_subscriber_code: Option<String>,
) -> TenantId {
    db_pool
        .db_query(move |conn| -> TenantId {
            let tenant = db::tests::fixtures::tenant::create_with_keys(conn, public_key, e_private_key);
            DbTenantVendorControl::create(
                conn,
                tenant.id.clone(),
                idology_enabled,
                idology_username,
                idology_e_password,
                experian_enabled,
                experian_subscriber_code,
            )
            .unwrap();

            tenant.id
        })
        .await
        .unwrap()
}

struct DefaultCredentials {
    pub idology: IdologyCredentials,
    pub experian: ExperianCredentials,
}
async fn get_tenant_vendor_control(
    tenant_id: TenantId,
    db_pool: &TestDbPool,
    config: &Config,
    enclave_client: &EnclaveClient,
) -> (DefaultCredentials, TenantVendorControl) {
    let tvc = TenantVendorControl::new(tenant_id, db_pool, enclave_client, config)
        .await
        .unwrap();

    let experian_builder = ExperianCredentialBuilder::from(config);
    let default_sub_code = config.experian.subscriber_code.clone();
    let experian_creds = experian_builder.build_with_subscriber_code(default_sub_code);

    (
        DefaultCredentials {
            idology: IdologyCredentials::from(config),
            experian: experian_creds,
        },
        tvc,
    )
}

#[test_db_pool]
async fn test_update_credentials(db_pool: TestDbPool) {
    let state = &StateWithMockEnclave::init().await.state;
    let (pk, tenant_e_key) = state.enclave_client.generate_sealed_keypair().await.unwrap();
    let pk2 = pk.clone();
    let tenant_e_key2 = tenant_e_key.clone();

    // No TVC, credentials should be the same
    let tenant_with_no_tvc = db_pool
        .db_query(move |conn| db::tests::fixtures::tenant::create_with_keys(conn, pk2, tenant_e_key2))
        .await
        .unwrap();
    let (default_creds_from_state, updated) = get_tenant_vendor_control(
        tenant_with_no_tvc.id,
        &db_pool,
        &state.config,
        &state.enclave_client,
    )
    .await;
    assert_eq!(default_creds_from_state.idology, updated.idology_credentials());
    assert_eq!(default_creds_from_state.experian, updated.experian_credentials());

    // -------------------
    // ---- Experian -------
    // -------------------
    // if experian enabled, and a sub code provided, we update
    let t = create_db_vendor_control(
        &db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        None,
        None,
        true,
        Some("sub_code123".into()),
    )
    .await;

    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(
        updated.experian_credentials().subscriber_code,
        "sub_code123".into()
    );
    assert_ne!(default_creds_from_state.experian, updated.experian_credentials());

    // if experian isn't enabled, we shouldn't change credentials, even if provided
    let t = create_db_vendor_control(
        &db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        None,
        None,
        false,
        Some("sub_code123".into()),
    )
    .await;
    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.experian, updated.experian_credentials());

    // if experian sub code isn't provided, we shouldn't change credentials,
    let t = create_db_vendor_control(
        &db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        None,
        None,
        true,
        None,
    )
    .await;
    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.experian, updated.experian_credentials());
    // -------------------
    // ---- Idology -------
    // -------------------
    // if idology enabled, update un/pw
    let t = create_db_vendor_control(
        &db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        true,
        Some("id_username".into()),
        Some(pk.seal_pii(&"id_password".into()).unwrap()),
        // false
        false,
        None,
    )
    .await;

    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &db_pool, &state.config, &state.enclave_client).await;
    assert_ne!(default_creds_from_state.idology, updated.idology_credentials());
    assert_eq!(updated.idology_credentials().password, "id_password".into());
    assert_eq!(updated.idology_credentials().username, "id_username".into());

    // if idology not enabled, don't update
    let t = create_db_vendor_control(
        &db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        Some("id_username".into()),
        Some(pk.seal_pii(&"id_password".into()).unwrap()),
        false,
        None,
    )
    .await;

    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.idology, updated.idology_credentials());

    // If only pw provided, don't update
    let t = create_db_vendor_control(
        &db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        None,
        Some(pk.seal_pii(&"id_password".into()).unwrap()),
        // false
        false,
        None,
    )
    .await;

    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.idology, updated.idology_credentials());
}

pub mod fixtures {
    use db::models::tenant_vendor::TenantVendorControl as DbTenantVendorControl;
    use newtypes::EncryptedVaultPrivateKey;

    use crate::{decision::vendor::tenant_vendor_control::TenantVendorControl, State};

    pub async fn create(
        state: &State,
        vendor_control: Option<DbTenantVendorControl>,
        tenant_e_private_key: EncryptedVaultPrivateKey,
    ) -> TenantVendorControl {
        TenantVendorControl::new_for_test(
            &state.config,
            vendor_control,
            &state.enclave_client,
            &tenant_e_private_key,
        )
        .await
        .expect("couldn't create tenant vendor control")
    }
}

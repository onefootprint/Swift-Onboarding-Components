use crate::config::Config;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::enclave_client::EnclaveClient;
use crate::State;
use db::models::tenant_vendor::TenantVendorControl as DbTenantVendorControl;
use db::models::tenant_vendor::UpdateTenantVendorControlArgs;
use db::tests::test_db_pool::TestDbPool;
use db::DbPool;
use macros::test_state;
use newtypes::vendor_credentials::ExperianCredentialBuilder;
use newtypes::vendor_credentials::ExperianCredentials;
use newtypes::vendor_credentials::IdologyCredentials;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::TenantId;
use newtypes::VaultPublicKey;

#[allow(clippy::too_many_arguments)]
async fn create_db_vendor_control(
    db_pool: &DbPool,
    public_key: VaultPublicKey,
    e_private_key: EncryptedVaultPrivateKey,
    idology_enabled: bool,
    experian_enabled: bool,
    experian_subscriber_code: Option<String>,
) -> TenantId {
    db_pool
        .db_transaction(move |conn| {
            let tenant = db::tests::fixtures::tenant::create_with_keys(conn, public_key, e_private_key);
            let args = UpdateTenantVendorControlArgs {
                idology_enabled: Some(idology_enabled),
                experian_enabled: Some(experian_enabled),
                experian_subscriber_code: Some(experian_subscriber_code),
                ..Default::default()
            };
            DbTenantVendorControl::update_or_create(conn, &tenant.id, args).unwrap();

            Ok(tenant.id)
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
    db_pool: &DbPool,
    config: &Config,
    enclave_client: &EnclaveClient,
) -> (DefaultCredentials, TenantVendorControl) {
    let tvc = TenantVendorControl::new(tenant_id, db_pool, config, enclave_client)
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

#[test_state]
async fn test_update_credentials(state: &mut State) {
    let (pk, tenant_e_key) = state.enclave_client.generate_sealed_keypair().await.unwrap();
    let pk2 = pk.clone();
    let tenant_e_key2 = tenant_e_key.clone();

    // No TVC, credentials should be the same
    let tenant_with_no_tvc = state
        .db_transaction(move |conn| {
            Ok(db::tests::fixtures::tenant::create_with_keys(
                conn,
                pk2,
                tenant_e_key2,
            ))
        })
        .await
        .unwrap();
    let (default_creds_from_state, updated) = get_tenant_vendor_control(
        tenant_with_no_tvc.id,
        &state.db_pool,
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
        &state.db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        true,
        Some("sub_code123".into()),
    )
    .await;

    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &state.db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(
        updated.experian_credentials().subscriber_code,
        "sub_code123".into()
    );
    assert_ne!(default_creds_from_state.experian, updated.experian_credentials());
    assert!(updated
        .enabled_vendor_apis()
        .into_iter()
        .map(newtypes::Vendor::from)
        .collect::<Vec<newtypes::Vendor>>()
        .contains(&newtypes::Vendor::Experian));

    // if experian isn't enabled, we shouldn't change credentials, even if provided
    let t = create_db_vendor_control(
        &state.db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        false,
        Some("sub_code123".into()),
    )
    .await;
    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &state.db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.experian, updated.experian_credentials());
    // if idology is not enabled, we should not see any enabled vendor apis
    assert!(!updated
        .enabled_vendor_apis()
        .into_iter()
        .map(newtypes::Vendor::from)
        .collect::<Vec<newtypes::Vendor>>()
        .contains(&newtypes::Vendor::Experian));

    // if experian sub code isn't provided, we shouldn't change credentials,
    let t = create_db_vendor_control(
        &state.db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        true,
        None,
    )
    .await;
    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &state.db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.experian, updated.experian_credentials());
    // -------------------
    // ---- Idology -------
    // -------------------
    // if idology enabled, update un/pw
    let t = create_db_vendor_control(
        &state.db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        true,
        // false
        false,
        None,
    )
    .await;

    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &state.db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.idology, updated.idology_credentials());
    // if idology is not enabled, we should not see any enabled vendor apis
    assert!(updated
        .enabled_vendor_apis()
        .into_iter()
        .map(newtypes::Vendor::from)
        .collect::<Vec<newtypes::Vendor>>()
        .contains(&newtypes::Vendor::Idology));

    // if idology not enabled, don't update
    let t = create_db_vendor_control(
        &state.db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        false,
        None,
    )
    .await;

    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &state.db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.idology, updated.idology_credentials());
    // if idology is not enabled, we should not see any enabled vendor apis
    assert!(!updated
        .enabled_vendor_apis()
        .into_iter()
        .map(newtypes::Vendor::from)
        .collect::<Vec<newtypes::Vendor>>()
        .contains(&newtypes::Vendor::Idology));

    // If only pw provided, don't update
    let t = create_db_vendor_control(
        &state.db_pool,
        pk.clone(),
        tenant_e_key.clone(),
        false,
        false,
        None,
    )
    .await;
    // TODO: remove this test in next PR
    let (default_creds_from_state, updated) =
        get_tenant_vendor_control(t, &state.db_pool, &state.config, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.idology, updated.idology_credentials());
}

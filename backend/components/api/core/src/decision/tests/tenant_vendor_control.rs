use std::str::FromStr;

use chrono::Utc;
use db::models::tenant_vendor::TenantVendorControl as DbTenantVendorControl;
use newtypes::{
    vendor_credentials::IdologyCredentials, EncryptedVaultPrivateKey, SealedVaultBytes, TenantId,
    TenantVendorControlId,
};

use crate::{
    decision::vendor::tenant_vendor_control::TenantVendorControl, enclave_client::EnclaveClient,
    utils::mock_enclave::StateWithMockEnclave, State,
};

fn db_vendor_control(
    idology_enabled: bool,
    idology_username: Option<String>,
    idology_e_password: Option<SealedVaultBytes>,
    experian_enabled: bool,
    experian_subscriber_code: Option<String>,
) -> DbTenantVendorControl {
    DbTenantVendorControl {
        id: TenantVendorControlId::from_str("id1").unwrap(),
        tenant_id: TenantId::from_str("t1").unwrap(),
        deactivated_at: None,
        _created_at: Utc::now(),
        _updated_at: Utc::now(),
        idology_enabled,
        idology_username,
        idology_e_password,
        experian_enabled,
        experian_subscriber_code,
    }
}

struct DefaultCredentials {
    pub idology: IdologyCredentials,
}
async fn new_tenant_vendor_control(
    state: &State,
    db_tenant_vendor_control: Option<DbTenantVendorControl>,
    tenant_key: &EncryptedVaultPrivateKey,
    enclave_client: &EnclaveClient,
) -> (DefaultCredentials, TenantVendorControl) {
    let tvc = TenantVendorControl::new(
        &state.config,
        db_tenant_vendor_control,
        enclave_client,
        tenant_key,
    )
    .await
    .unwrap();

    (
        DefaultCredentials {
            idology: IdologyCredentials::from(&state.config),
        },
        tvc,
    )
}

#[tokio::test]
async fn test_update_credentials() {
    let state = &StateWithMockEnclave::init().await.state;
    let (pk, tenant_e_key) = state.enclave_client.generate_sealed_keypair().await.unwrap();

    // No TVC, credentials should be the same
    let (default_creds_from_state, updated) =
        new_tenant_vendor_control(state, None, &tenant_e_key, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.idology, updated.idology_credentials());

    // -------------------
    // ---- Idology -------
    // -------------------
    // if idology enabled, update un/pw
    let db_idology = Some(db_vendor_control(
        true,
        Some("id_username".into()),
        Some(pk.seal_pii(&"id_password".into()).unwrap()),
        // false
        false,
        None,
    ));

    let (default_creds_from_state, updated) =
        new_tenant_vendor_control(state, db_idology, &tenant_e_key, &state.enclave_client).await;
    assert_ne!(default_creds_from_state.idology, updated.idology_credentials());
    assert_eq!(updated.idology_credentials().password, "id_password".into());
    assert_eq!(updated.idology_credentials().username, "id_username".into());

    // if idology not enabled, don't update
    let db_idology2 = Some(db_vendor_control(
        false,
        Some("id_username".into()),
        Some(pk.seal_pii(&"id_password".into()).unwrap()),
        false,
        None,
    ));

    let (default_creds_from_state, updated) =
        new_tenant_vendor_control(state, db_idology2, &tenant_e_key, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.idology, updated.idology_credentials());

    // If only pw provided, don't update
    let db_idology3 = Some(db_vendor_control(
        false,
        None,
        Some(pk.seal_pii(&"id_password".into()).unwrap()),
        // false
        false,
        None,
    ));

    let (default_creds_from_state, updated) =
        new_tenant_vendor_control(state, db_idology3, &tenant_e_key, &state.enclave_client).await;
    assert_eq!(default_creds_from_state.idology, updated.idology_credentials());
}

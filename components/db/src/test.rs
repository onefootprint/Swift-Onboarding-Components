use crate::{models::user_data::NewUserData, run_migrations};
use newtypes::{
    DataGroupId, EncryptedVaultPrivateKey, Fingerprint, SealedVaultBytes, Status, VaultPublicKey,
};

#[actix_rt::test]
async fn test_db() {
    // TODO put this test in a transaction
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions
    let db_url = std::env::var("DATABASE_URL").expect("couldn't parse DB url from environment");

    // Run migrations on this DB if they haven't been run yet
    run_migrations(&db_url).expect("couldn't run migrations on DB");

    let pool = crate::init(&db_url).expect("couldn't initiate DB pool");
    let tenant = crate::models::tenants::NewTenant {
        name: "test_tenant".to_owned(),
        e_private_key: EncryptedVaultPrivateKey("private key".as_bytes().to_vec()),
        public_key: VaultPublicKey::unvalidated("public key".as_bytes().to_vec()),
        workos_id: "test".to_owned(),
        email_domain: "dbtest.com".to_owned(),
    };
    let _tenant = crate::tenant::init_or_get(&pool, tenant)
        .await
        .expect("couldn't create tenant");
    let uv = crate::user_vault::create(
        &pool,
        crate::models::user_vaults::NewUserVaultReq {
            e_private_key: EncryptedVaultPrivateKey("private key".as_bytes().to_vec()),
            public_key: VaultPublicKey::unvalidated("public key".as_bytes().to_vec()),
            id_verified: Status::Incomplete,
            e_phone_number: SealedVaultBytes("blah".as_bytes().to_vec()),
            sh_phone_number: Fingerprint(
                crypto::random::gen_random_alphanumeric_code(32)
                    .as_bytes()
                    .to_vec(),
            ),
            e_phone_country: SealedVaultBytes("blah".as_bytes().to_vec()),
        },
    )
    .await
    .expect("couldn't init user vault");

    let data_group_id = DataGroupId::generate();
    let test_data = NewUserData {
        user_vault_id: uv.id.clone(),
        data_kind: newtypes::DataKind::Email,
        data_group_id: data_group_id.clone(),
        data_group_kind: newtypes::DataGroupKind::Email,
        data_group_priority: newtypes::DataPriority::Primary,
        e_data: SealedVaultBytes("blah".as_bytes().to_vec()),
        sh_data: Some(Fingerprint(
            crypto::random::gen_random_alphanumeric_code(32)
                .as_bytes()
                .to_vec(),
        )),
        is_verified: false,
    };
    pool.db_transaction(move |conn| test_data.insert(conn))
        .await
        .expect("couldn't create user data");
    let test_data_bad_group_uuid = NewUserData {
        user_vault_id: uv.id,
        data_kind: newtypes::DataKind::FirstName,
        data_group_id,
        data_group_kind: newtypes::DataGroupKind::FullName,
        data_group_priority: newtypes::DataPriority::Primary,
        e_data: SealedVaultBytes("blah".as_bytes().to_vec()),
        sh_data: Some(Fingerprint(
            crypto::random::gen_random_alphanumeric_code(32)
                .as_bytes()
                .to_vec(),
        )),
        is_verified: false,
    };
    let bad_data = pool
        .db_transaction(move |conn| test_data_bad_group_uuid.insert(conn))
        .await;
    assert!(bad_data.is_err())
    // TODO find_by_phone_number and find_by_email
}

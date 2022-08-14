use crate::run_migrations;
use newtypes::{EncryptedVaultPrivateKey, Fingerprint, SealedVaultBytes, VaultPublicKey};

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
        logo_url: None,
        workos_id: None,
        workos_admin_profile_id: None,
        sandbox_restricted: true,
    };
    let _tenant = tenant.create(&pool).await.expect("couldn't create tenant");

    crate::user_vault::create(
        &pool,
        crate::models::user_vaults::NewPortableUserVaultReq {
            e_private_key: EncryptedVaultPrivateKey("private key".as_bytes().to_vec()),
            public_key: VaultPublicKey::unvalidated("public key".as_bytes().to_vec()),
            e_phone_number: SealedVaultBytes("blah".as_bytes().to_vec()),
            sh_phone_number: Fingerprint(
                crypto::random::gen_random_alphanumeric_code(32)
                    .as_bytes()
                    .to_vec(),
            ),
            sh_phone_country: Fingerprint(
                crypto::random::gen_random_alphanumeric_code(32)
                    .as_bytes()
                    .to_vec(),
            ),
            e_phone_country: SealedVaultBytes("blah".as_bytes().to_vec()),
            is_live: false,
        },
    )
    .await
    .expect("couldn't init user vault");

    // TODO find_by_phone_number and find_by_email
}

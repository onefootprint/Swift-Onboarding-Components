use diesel::{Connection, PgConnection};

#[actix_rt::test]
async fn test_db() {
    // TODO put this test in a transaction
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions
    let db_url = std::env::var("DATABASE_URL").expect("couldn't parse DB url from environment");

    // Run migrations on this DB if they haven't been run yet
    let conn = PgConnection::establish(&db_url).expect("couldn't open connection to DB");
    crate::embedded_migrations::run(&conn).expect("couldn't run migrations on DB");

    let pool = crate::init(&db_url).expect("coudln't initiate DB pool");
    let tenant = crate::models::tenants::NewTenant {
        name: "test_tenant".to_owned(),
        public_key: "".as_bytes().to_vec(),
        e_private_key: "".as_bytes().to_vec(),
    };
    let tenant = crate::tenant::init(&pool, tenant)
        .await
        .expect("couldn't create tenant");
    let user = crate::models::user_vaults::NewUserVault {
        e_private_key: "private key".as_bytes().to_vec(),
        public_key: "public key".as_bytes().to_vec(),
        id_verified: crate::models::types::Status::Incomplete,
    };
    let (onboarding, onboarding_session_token) = crate::user_vault::init(&pool, user, tenant.id)
        .await
        .expect("couldnt init user vault");
    let e_phone_number = crypto::random::gen_random_alphanumeric_code(16)
        .as_bytes()
        .to_vec();

    let sh_phone_number = crypto::random::gen_random_alphanumeric_code(16)
        .as_bytes()
        .to_vec();
    let (challenge, code) = crate::challenge::create(
        &pool,
        onboarding.user_vault_id.clone(),
        e_phone_number.clone(),
        sh_phone_number.clone(),
        crate::models::types::ChallengeKind::PhoneNumber,
    )
    .await
    .expect("couldn't create challenge");
    crate::challenge::verify(
        &pool,
        challenge.id,
        onboarding.user_vault_id.clone(),
        "flerp bad code derp".to_owned(),
    )
    .await
    .expect_err("challenge shouldn't succeed with incorrect code");
    crate::challenge::verify(&pool, challenge.id, onboarding.user_vault_id.clone(), code)
        .await
        .expect("couldn't verify challenge");
    let (user_vault, _) = crate::user_vault::get_by_token(&pool, onboarding_session_token)
        .await
        .expect("couldn't fetch user by token");
    assert_eq!(
        user_vault
            .sh_phone_number
            .expect("expected sh_phone_number to be set"),
        sh_phone_number,
    );
    assert_eq!(
        user_vault
            .e_phone_number
            .expect("expected e_phone_number to be set"),
        e_phone_number,
    );
}

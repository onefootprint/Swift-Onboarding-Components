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
    let _tenant = crate::tenant::init(&pool, tenant)
        .await
        .expect("couldn't create tenant");
    let user_vault = crate::models::user_vaults::NewUserVault {
        e_private_key: "private key".as_bytes().to_vec(),
        public_key: "public key".as_bytes().to_vec(),
        id_verified: crate::models::types::Status::Incomplete,
        e_phone_number: "".as_bytes().to_vec(),
        sh_phone_number: "".as_bytes().to_vec(),
    }
    .save(&pool)
    .await
    .expect("couldn't init user vault");

    let sh_phone_number = crypto::random::gen_random_alphanumeric_code(16)
        .as_bytes()
        .to_vec();
    crate::user_vault::update(
        &pool,
        crate::models::user_vaults::UpdateUserVault {
            id: user_vault.id.clone(),
            sh_phone_number: Some(sh_phone_number.to_vec()),
            ..Default::default()
        },
    )
    .await
    .expect("couldn't update user");

    // TODO find_by_phone_number and find_by_email
}

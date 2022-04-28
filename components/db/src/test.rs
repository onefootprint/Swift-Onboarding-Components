#[cfg(test)]
mod tests {
    use diesel::{PgConnection, Connection};

    #[actix_rt::test]
    async fn test_db() {
        // TODO put this test in a transaction
        let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions
        let db_url = std::env::var("DATABASE_URL").expect("couldn't parse DB url from environment");

        // Run migrations on this DB if they haven't been run yet
        let conn = PgConnection::establish(&db_url).expect("couldn't open connection to DB");
        crate::embedded_migrations::run(&conn).expect("couldn't run migrations on DB");

        let pool = crate::init(&db_url).expect("coudln't initiate DB pool");
        let tenant = crate::models::tenants::NewTenant{
            name: "test_tenant".to_owned(),
            public_key: "".as_bytes().to_vec(),
            e_private_key: "".as_bytes().to_vec(),
        };
        let tenant = crate::tenant::init(&pool, tenant)
            .await.expect("couldn't create tenant");
        let user = crate::models::user_vaults::NewUserVault{
            e_private_key: "private key".as_bytes().to_vec(),
            public_key: "public key".as_bytes().to_vec(),
            id_verified: crate::models::types::Status::Incomplete,
            is_phone_number_verified: false,
            is_email_verified: false,
        };
        let (onboarding, _) = 
            crate::user_vault::init(&pool, user, tenant.id)
            .await.expect("couldnt init user vault");
        let sh_phone_number = "1234".as_bytes();
        crate::user_vault::update(&pool, crate::models::user_vaults::UpdateUserVault{
            id: onboarding.user_vault_id.clone(),
            e_first_name: None,
            e_last_name: None,
            e_dob: None,
            e_ssn: None,
            sh_ssn: None,
            e_street_address: None,
            e_city: None,
            e_state: None,
            e_email: None,
            is_email_verified: None,
            sh_email: None,
            e_phone_number: None,
            is_phone_number_verified: None,
            sh_phone_number: Some(sh_phone_number.to_vec()),
            id_verified: crate::models::types::Status::Processing,
        }).await.expect("couldn't update user");
        let (challenge, code) = 
            crate::challenge::create(&pool, onboarding.user_vault_id.clone(), sh_phone_number.to_vec(), crate::models::types::ChallengeKind::PhoneNumber)
            .await.expect("couldn't create challenge");
        crate::challenge::verify(&pool, challenge.id, onboarding.user_vault_id.clone(), "flerp bad code derp".to_owned())
            .await.expect_err("challenge shouldn't succeed with incorrect code");
        crate::challenge::verify(&pool, challenge.id, onboarding.user_vault_id.clone(), code)
            .await.expect("couldn't verify challenge");
    }
}
use crate::{
    models::{
        tenant::{NewTenant, Tenant},
        user_vault::{NewUserVault, UserVault},
    },
    run_migrations, schema,
};
use diesel::prelude::*;
use diesel::{Connection, PgConnection};
use newtypes::{EncryptedVaultPrivateKey, Fingerprint, SealedVaultBytes, VaultPublicKey};

use std::sync::Once;

static INIT: Once = Once::new();

fn run_migrations_once(db_url: String) {
    INIT.call_once(move || {
        // Run migrations on this DB if they haven't been run yet
        run_migrations(&db_url).expect("couldn't run migrations on DB");
    });
}

pub(crate) fn test_db_conn() -> PgConnection {
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions
    let db_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "postgresql://localhost/footprint_db".to_string());

    run_migrations_once(db_url.clone());
    PgConnection::establish(&db_url).expect("failed to open test db connection")
}

pub(crate) fn test_user_vault(conn: &mut PgConnection, is_portable: bool) -> UserVault {
    diesel::insert_into(schema::user_vault::table)
        .values(&NewUserVault {
            e_private_key: EncryptedVaultPrivateKey(vec![]),
            public_key: VaultPublicKey::unvalidated(vec![]),
            is_live: true,
            is_portable,
        })
        .get_result(conn)
        .expect("failed to create user vault")
}

pub(crate) fn test_tenant(conn: &mut PgConnection) -> Tenant {
    diesel::insert_into(schema::tenant::table)
        .values(&NewTenant {
            name: "TestTenant".into(),
            public_key: VaultPublicKey::unvalidated(vec![]),
            e_private_key: EncryptedVaultPrivateKey(vec![]),
            workos_id: None,
            logo_url: None,
            workos_admin_profile_id: None,
            sandbox_restricted: false,
        })
        .get_result(conn)
        .expect("failed to create user vault")
}

#[actix_rt::test]
async fn test_db() {
    // TODO put this test in a transaction
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions
    let db_url = std::env::var("DATABASE_URL").expect("couldn't parse DB url from environment");

    // Run migrations on this DB if they haven't been run yet
    run_migrations_once(db_url.clone());

    let pool = crate::init(&db_url).expect("couldn't initiate DB pool");
    let tenant = crate::models::tenant::NewTenant {
        name: "test_tenant".to_owned(),
        e_private_key: EncryptedVaultPrivateKey("private key".as_bytes().to_vec()),
        public_key: VaultPublicKey::unvalidated("public key".as_bytes().to_vec()),
        logo_url: None,
        workos_id: None,
        workos_admin_profile_id: None,
        sandbox_restricted: true,
    };
    pool.db_query(|conn| tenant.save(conn).expect("couldn't create tenant"))
        .await
        .expect("couldn't make DB query");

    crate::user_vault::create(
        &pool,
        crate::models::user_vault::NewPortableUserVaultReq {
            e_private_key: EncryptedVaultPrivateKey("private key".as_bytes().to_vec()),
            public_key: VaultPublicKey::unvalidated("public key".as_bytes().to_vec()),
            e_phone_number: SealedVaultBytes("blah".as_bytes().to_vec()),
            sh_phone_number: Fingerprint(
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

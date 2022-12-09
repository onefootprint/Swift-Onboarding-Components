use crate::models::annotation::{Annotation, AnnotationInfo};
use crate::models::tenant_api_key::NewTenantApiKey;
use crate::models::tenant_api_key::TenantApiKey;
use crate::models::tenant_role::TenantRole;
use crate::models::tenant_user::TenantUser;
use crate::models::user_timeline::UserTimeline;
use crate::{
    models::{
        tenant::{NewTenant, Tenant},
        user_vault::{NewUserVault, UserVault},
    },
    schema,
};
use crate::{test_helpers, TxnPgConnection};
use chrono::Utc;
use diesel::prelude::*;

use newtypes::{
    ApiKeyStatus, DbActor, EncryptedVaultPrivateKey, Fingerprint, OrgMemberEmail, ScopedUserId,
    SealedVaultBytes, TenantId, TenantRoleId, UserVaultId, VaultPublicKey,
};

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
            sandbox_restricted: false,
        })
        .get_result(conn)
        .expect("failed to create user vault")
}

pub(crate) fn test_tenant_admin_role(conn: &mut TxnPgConnection, tenant_id: TenantId) -> TenantRole {
    TenantRole::get_or_create_admin_role(conn, tenant_id).unwrap()
}

pub(crate) fn test_tenant_user(
    conn: &mut TxnPgConnection,
    email: String,
    tenant_id: TenantId,
    tenant_role_id: TenantRoleId,
    first_name: Option<String>,
    last_name: Option<String>,
) -> TenantUser {
    let (tenant_user, _) = TenantUser::create(
        conn,
        OrgMemberEmail::from(email),
        tenant_id,
        tenant_role_id,
        first_name,
        last_name,
    )
    .unwrap();
    tenant_user
}

pub(crate) fn test_annotation<T>(
    conn: &mut TxnPgConnection,
    note: String,
    is_pinned: bool,
    scoped_user_id: ScopedUserId,
    user_vault_id: UserVaultId,
    actor: T,
) -> AnnotationInfo
where
    T: Into<DbActor>, // + Send + Sync + 'static, //TODO: is this chill
{
    // TODO: as noted in #[post("/users/{footprint_user_id}/annotations")], the Annotation + UserTimeline creations here should be thrown into a helper (or db) func so that tests
    //      (and other future users) don't need to recreate the logic that route is doing

    let annotation = Annotation::create(conn, note, is_pinned, scoped_user_id, actor).unwrap();
    UserTimeline::create(
        conn,
        newtypes::AnnotationInfo {
            annotation_id: annotation.0.id.clone(),
        },
        user_vault_id,
        None,
    )
    .unwrap();
    annotation
}

// TODO: TenantApiKey::create takes in a db_pool instead of a conn which is why this function can't call it and has to duplicate what it does here.
// we should probably refactor TenantApiKey::create to take in a conn which is our more cannonical pattern
pub(crate) fn test_tenant_api_key(
    conn: &mut PgConnection,
    name: String,
    tenant_id: TenantId,
    is_live: bool,
) -> TenantApiKey {
    let new_key = NewTenantApiKey {
        name,
        sh_secret_api_key: Fingerprint(vec![0, 1, 2]),
        e_secret_api_key: SealedVaultBytes(vec![4, 5, 6]),
        tenant_id,
        is_live,
        status: ApiKeyStatus::Enabled,
        created_at: Utc::now(),
    };
    diesel::insert_into(schema::tenant_api_key::table)
        .values(new_key)
        .get_result::<TenantApiKey>(conn)
        .unwrap()
}

#[actix_rt::test]
async fn test_db() {
    // TODO put this test in a transaction
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions
    let db_url = std::env::var("DATABASE_URL").expect("couldn't parse DB url from environment");

    // Run migrations on this DB if they haven't been run yet
    test_helpers::run_migrations_once(db_url.clone());

    let pool = crate::init(&db_url).expect("couldn't initiate DB pool");
    let tenant = crate::models::tenant::NewTenant {
        name: "test_tenant".to_owned(),
        e_private_key: EncryptedVaultPrivateKey("private key".as_bytes().to_vec()),
        public_key: VaultPublicKey::unvalidated("public key".as_bytes().to_vec()),
        logo_url: None,
        workos_id: None,
        sandbox_restricted: true,
    };
    pool.db_query(|conn| tenant.save(conn).expect("couldn't create tenant"))
        .await
        .expect("couldn't make DB query");

    let new_user = crate::models::user_vault::NewUserVaultArgs {
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
        tenant_id: None,
    };
    pool.db_transaction(|conn| UserVault::create(conn, new_user))
        .await
        .expect("couldn't init user vault");

    // TODO find_by_phone_number and find_by_email
}

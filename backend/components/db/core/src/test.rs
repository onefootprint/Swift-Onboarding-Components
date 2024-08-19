use crate::models::annotation::Annotation;
use crate::models::annotation::AnnotationInfo;
use crate::models::tenant_api_key::TenantApiKey;
use crate::models::tenant_user::TenantUser;
use crate::models::user_timeline::UserTimeline;
use crate::TxnPgConn;
use newtypes::DbActor;
use newtypes::Fingerprint;
use newtypes::OrgMemberEmail;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultBytes;
use newtypes::TenantId;
use newtypes::TenantRoleId;
use newtypes::VaultId;
use std::str::FromStr;

pub(crate) fn test_tenant_user(
    conn: &mut TxnPgConn,
    email: String,
    first_name: Option<String>,
    last_name: Option<String>,
) -> TenantUser {
    TenantUser::get_and_update_or_create(
        conn,
        OrgMemberEmail::from_str(&email).unwrap(),
        first_name,
        last_name,
    )
    .unwrap()
}

pub(crate) fn test_annotation<T>(
    conn: &mut TxnPgConn,
    note: String,
    is_pinned: bool,
    scoped_user_id: ScopedVaultId,
    user_vault_id: VaultId,
    actor: T,
) -> AnnotationInfo
where
    T: Into<DbActor>, // + Send + Sync + 'static, //TODO: is this chill
{
    // TODO: as noted in #[post("/users/{footprint_user_id}/annotations")], the Annotation +
    // UserTimeline creations here should be thrown into a helper (or db) func so that tests
    //      (and other future users) don't need to recreate the logic that route is doing

    let annotation = Annotation::create(conn, note, is_pinned, scoped_user_id.clone(), actor).unwrap();
    UserTimeline::create(
        conn,
        newtypes::AnnotationInfo {
            annotation_id: annotation.0.id.clone(),
        },
        user_vault_id,
        scoped_user_id,
    )
    .unwrap();
    annotation
}

pub(crate) fn test_tenant_api_key(
    conn: &mut TxnPgConn,
    name: String,
    tenant_id: TenantId,
    is_live: bool,
    role_id: TenantRoleId,
) -> TenantApiKey {
    TenantApiKey::create(
        conn,
        name,
        Fingerprint(vec![0, 1, 2]),
        SealedVaultBytes(vec![4, 5, 6]),
        tenant_id,
        is_live,
        role_id,
    )
    .unwrap()
}

#[allow(clippy::module_inception)]
#[cfg(test)]
mod test {
    use crate::models::tenant::Tenant;
    use crate::models::vault::Vault;
    use crate::test_helpers;
    use crate::DbResult;
    use diesel::sql_query;
    use diesel::sql_types::Text;
    use diesel::RunQueryDsl;
    use newtypes::EncryptedVaultPrivateKey;
    use newtypes::SandboxId;
    use newtypes::VaultKind;
    use newtypes::VaultPublicKey;
    use std::time::Duration;

    #[actix_rt::test]
    async fn test_db() {
        // TODO put this test in a transaction
        let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions
        let db_url = std::env::var("DATABASE_URL").expect("couldn't parse DB url from environment");

        // Run migrations on this DB if they haven't been run yet
        test_helpers::run_migrations_once(db_url.clone());

        let pool = crate::init(&db_url, Duration::from_secs(30), 5).expect("couldn't initiate DB pool");
        let tenant = crate::models::tenant::NewTenant {
            name: "test_tenant".to_owned(),
            e_private_key: EncryptedVaultPrivateKey("private key".as_bytes().to_vec()),
            public_key: VaultPublicKey::unvalidated("public key".as_bytes().to_vec()),
            workos_id: None,
            logo_url: None,
            sandbox_restricted: true,
            is_demo_tenant: false,
            is_prod_ob_config_restricted: true,
            is_prod_kyb_playbook_restricted: true,
            is_prod_auth_playbook_restricted: true,
            domains: vec![],
            allow_domain_access: false,
            super_tenant_id: None,
            website_url: None,
            company_size: None,
        };
        pool.db_transaction(|conn| Tenant::create(conn, tenant))
            .await
            .expect("couldn't make DB query");

        let new_user = crate::models::vault::NewVaultArgs {
            e_private_key: EncryptedVaultPrivateKey("private key".as_bytes().to_vec()),
            public_key: VaultPublicKey::unvalidated("public key".as_bytes().to_vec()),
            is_live: false,
            kind: VaultKind::Person,
            is_fixture: false,
            sandbox_id: Some(SandboxId::new()),
            is_created_via_api: false,
            duplicate_of_id: None,
        };
        pool.db_transaction(|conn| -> DbResult<_> {
            let result = Vault::create(conn, new_user)?.into_inner();
            Ok(result)
        })
        .await
        .expect("couldn't init user vault");

        // TODO find_by_phone_number and find_by_email
    }

    #[ignore] // note: we realized that these update triggers are actually quite dangerous, and we dont use them.
    #[tokio::test]
    async fn test_diesel_manage_updated_at_trigger_present_on_all_tables() {
        #[derive(QueryableByName, Debug)]
        struct Res {
            #[diesel(sql_type = Text)]
            table_name: String,
        }
        let mut conn = test_helpers::test_db_conn();
        let res = sql_query("
            select table_name
            from information_schema.columns
            where
                column_name = '_updated_at'
                and table_name not in (select event_object_table from information_schema.triggers where action_statement = 'EXECUTE FUNCTION diesel_set_updated_at()');")
            .get_results::<Res>(&mut conn)
            .unwrap();

        assert!(
            res.is_empty(),
            "Found tables with `_updated_at` but no `set_updated_at` trigger: {}",
            res.into_iter()
                .map(|r| r.table_name)
                .collect::<Vec<String>>()
                .join(",")
        );
    }
}

//! Migrates our old phone and email format that had the sandbox suffix encrypted inline to instead have sandbox suffix elsewhere.

use super::CustomMigration;
use api_core::{errors::ApiResult, State};
use db::{
    models::{
        tenant_api_key::TenantApiKey,
        tenant_role::{ImmutableRoleKind, TenantRole},
        tenant_rolebinding::TenantRolebinding,
    },
    DbError, FpResult, PgConn, TxnPgConn,
};
use db_schema::schema::{tenant_api_key, tenant_role, tenant_rolebinding};
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::{TenantRoleId, TenantRoleKind, TenantRoleKindDiscriminant, TenantRolebindingId, TenantScope};

pub struct Migration;

impl std::fmt::Debug for Migration {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!("CustomMigration({})", Self::version()).fmt(f)
    }
}

#[derive(Debug)]
/// Objects that migrations need to execute
pub struct MigrationState {}

impl From<State> for MigrationState {
    fn from(_value: State) -> Self {
        Self {}
    }
}

impl CustomMigration for Migration {
    type MigrationState = MigrationState;

    fn version() -> String {
        "080323".into()
    }

    fn run(self, _state: MigrationState, conn: &mut TxnPgConn) -> ApiResult<()> {
        let results: Vec<_> = tenant_role::table
            .get_results::<TenantRole>(conn.conn())
            .map_err(DbError::from)?;

        tracing::info!("found {} roles to migrate", results.len());

        // TODO make immutable user roles
        for r in results {
            println!("Migrating role: {}", r.id);
            migrate_role(conn, r)?;
        }

        validate(conn)?;

        Ok(())
    }
}

fn migrate_role(conn: &mut TxnPgConn, role: TenantRole) -> FpResult<()> {
    println!("{:?}", role);
    // Some legacy legacy roles don't have read, which fails validation - this adds read perms everywhere
    let scopes = role
        .scopes
        .iter()
        .cloned()
        .chain([TenantScope::Read])
        .unique()
        .collect_vec();
    let api_key_scopes = scopes
        .iter()
        .filter(|s| s.role_kinds().contains(&TenantRoleKindDiscriminant::ApiKey))
        .cloned()
        .collect_vec();
    let user_scopes = scopes
        .into_iter()
        .filter(|s| {
            s.role_kinds()
                .contains(&TenantRoleKindDiscriminant::DashboardUser)
        })
        .collect_vec();

    if !api_key_scopes.is_empty() {
        // Create an equivalent role with the api key scopes
        let keys = tenant_api_key::table
            .filter(tenant_api_key::role_id.eq(&role.id))
            .get_results::<TenantApiKey>(conn.conn())?;
        println!("  APi keys: {}", keys.len());
        for is_live in [true, false] {
            let matching_ids = keys
                .iter()
                .filter(|k| k.is_live == is_live)
                .map(|k| k.id.clone())
                .collect_vec();
            if !matching_ids.is_empty() {
                // Create a new role with only the API key scopes, update all the keys to point to it
                let kind = TenantRoleKind::ApiKey { is_live };
                let api_key_role = create_role(conn, &role, api_key_scopes.clone(), kind)?;
                println!("   api_key_role: {:?}", api_key_role);
                diesel::update(tenant_api_key::table)
                    .filter(tenant_api_key::id.eq_any(&matching_ids))
                    .set(tenant_api_key::role_id.eq(&api_key_role.id))
                    .execute(conn.conn())?;
            }
        }
    }

    if !user_scopes.is_empty() {
        // Create an equivalent role with the api key scopes
        let rb_ids = tenant_rolebinding::table
            .filter(tenant_rolebinding::tenant_role_id.eq(&role.id))
            .select(tenant_rolebinding::id)
            .get_results::<TenantRolebindingId>(conn.conn())?;
        println!("  user scopes: {}", rb_ids.len());
        // Slightly different behavior here - since these will be rendered where the old roles used
        // to be in the settings tab, we don't want people to be confused when roles disappear.
        // So even if no one is using the role, create a modern role as long as there are dashboard user scopes
        let user_role = create_role(conn, &role, user_scopes, TenantRoleKind::DashboardUser)?;
        println!("   user_role: {:?}", user_role);
        if !rb_ids.is_empty() {
            println!("    backfilling");
            // Create a new role with only the user scopes, update all the keys to point to it
            diesel::update(tenant_rolebinding::table)
                .filter(tenant_rolebinding::id.eq_any(&rb_ids))
                .set(tenant_rolebinding::tenant_role_id.eq(&user_role.id))
                .execute(conn.conn())?;
        }
    }

    Ok(())
}

fn create_role(
    conn: &mut TxnPgConn,
    role: &TenantRole,
    scopes: Vec<TenantScope>,
    kind: TenantRoleKind,
) -> FpResult<TenantRole> {
    // Immutable roles are get_or_created, while other roles are just created
    if role.is_immutable {
        let irk = if role.name == "Admin" {
            ImmutableRoleKind::Admin
        } else if role.name == "Member" {
            ImmutableRoleKind::ReadOnly
        } else {
            panic!("unknown immutable role: {}", role.name);
        };
        TenantRole::get_or_create_immutable(conn, &role.tenant_id, irk, Some(kind))
    } else {
        TenantRole::create(
            conn,
            role.tenant_id.clone(),
            role.name.clone(),
            scopes,
            false,
            Some(kind),
        )
    }
}

fn validate(conn: &mut PgConn) -> FpResult<()> {
    // Make sure all API keys and Rolebindings now point to modern tenant roles
    let api_key_live_roles = tenant_api_key::table
        .filter(tenant_api_key::is_live.eq(true))
        .inner_join(tenant_role::table)
        .select(tenant_role::all_columns)
        .get_results::<TenantRole>(conn)?;
    assert!(api_key_live_roles
        .iter()
        .all(|r| r.kind == Some(TenantRoleKindDiscriminant::ApiKey) && r.is_live == Some(true)));

    let api_key_not_live_roles = tenant_api_key::table
        .filter(tenant_api_key::is_live.eq(false))
        .inner_join(tenant_role::table)
        .select(tenant_role::all_columns)
        .get_results::<TenantRole>(conn)?;
    assert!(api_key_not_live_roles
        .iter()
        .all(|r| r.kind == Some(TenantRoleKindDiscriminant::ApiKey) && r.is_live == Some(false)));

    let user_roles = tenant_rolebinding::table
        .inner_join(tenant_role::table)
        .select(tenant_role::all_columns)
        .get_results::<TenantRole>(conn)?;
    assert!(user_roles
        .iter()
        .all(|r| r.kind == Some(TenantRoleKindDiscriminant::DashboardUser)));

    // Make sure all old API keys have no rolebindings or API keys using them
    let old_role_ids = tenant_role::table
        .filter(tenant_role::kind.is_null())
        .select(tenant_role::id)
        .get_results::<TenantRoleId>(conn)?;
    let rbs: Vec<_> = tenant_rolebinding::table
        .filter(tenant_rolebinding::tenant_role_id.eq_any(&old_role_ids))
        .get_results::<TenantRolebinding>(conn)?;
    let api_keys: Vec<_> = tenant_api_key::table
        .filter(tenant_api_key::role_id.eq_any(&old_role_ids))
        .get_results::<TenantApiKey>(conn)?;
    assert!(rbs.is_empty());
    assert!(api_keys.is_empty());

    Ok(())
}

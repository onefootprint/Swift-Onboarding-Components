use crate::PgConn;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{
    scoped_vault,
    tenant::{self, BoxedQuery},
};
use diesel::insertable::CanInsertInSingleQuery;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::query_builder::QueryFragment;
use diesel::query_builder::QueryId;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    CompanySize, EncryptedVaultPrivateKey, ScopedVaultId, StripeCustomerId, TenantId, TenantRoleKind,
    TenantRoleKindDiscriminant, VaultId, VaultPublicKey, WorkosAuthMethod,
};
use serde::{Deserialize, Serialize};

use super::tenant_role::{ImmutableRoleKind, NewTenantRoleRow};

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = tenant)]
pub struct Tenant {
    pub id: TenantId,
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub workos_id: Option<String>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub logo_url: Option<String>,
    pub sandbox_restricted: bool,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
    pub privacy_policy_url: Option<String>,
    pub stripe_customer_id: Option<StripeCustomerId>,
    // TODO: consolidate with IsDemoTenant feature flag
    pub is_demo_tenant: bool,
    /// When non-null, pins arbitrary APIs to an older version because we believe that the tenant
    /// may be using an older version. These are only set manually through the DB shell.
    /// Be careful when using this.
    pub pinned_api_version: Option<i32>,
    // When true, don't allow creating ob configs in prod
    pub is_prod_ob_config_restricted: bool,
    pub domain: Option<String>,
    pub allow_domain_access: bool,
    /// When None, any method is allowed. When Some, only specified methods are allowed.
    pub supported_auth_methods: Option<Vec<WorkosAuthMethod>>,
}

impl Tenant {
    /// Support a version of the API that is backwards-compatible for some tenants that integrated
    /// Namely: `footprint_user_id` vs the new `fp_id` api format
    pub fn uses_legacy_serialization(&self) -> bool {
        self.pinned_api_version.map(|v| v <= 1) == Some(true)
    }
}

pub enum TenantIdentifier<'a> {
    Id(&'a TenantId),
    ScopedVaultId(&'a ScopedVaultId),
}

impl<'a> From<&'a TenantId> for TenantIdentifier<'a> {
    fn from(id: &'a TenantId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<&'a ScopedVaultId> for TenantIdentifier<'a> {
    fn from(id: &'a ScopedVaultId) -> Self {
        Self::ScopedVaultId(id)
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant)]
pub struct NewTenant {
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub workos_id: Option<String>,
    pub logo_url: Option<String>,
    pub sandbox_restricted: bool,
    pub is_prod_ob_config_restricted: bool,
    pub domain: Option<String>,
    pub allow_domain_access: bool,
}

/// Allows creating with an application-generated TenantId rather than db-generated
#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant)]
pub struct NewIntegrationTestTenant {
    pub id: TenantId,
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub sandbox_restricted: bool,
    pub is_demo_tenant: bool,
    pub is_prod_ob_config_restricted: bool,
    pub domain: Option<String>,
    pub allow_domain_access: bool,
}

impl Tenant {
    fn query(id: TenantIdentifier) -> BoxedQuery<Pg> {
        match id {
            TenantIdentifier::Id(id) => tenant::table.filter(tenant::id.eq(id)).into_boxed(),
            TenantIdentifier::ScopedVaultId(scoped_vault_id) => {
                let tenant_id = scoped_vault::table
                    .filter(scoped_vault::id.eq(scoped_vault_id))
                    .select(scoped_vault::tenant_id);
                tenant::table.filter(tenant::id.eq_any(tenant_id)).into_boxed()
            }
        }
    }
    #[tracing::instrument("Tenant::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &TenantId) -> DbResult<Self> {
        let tenant = tenant::table
            .for_no_key_update()
            .filter(tenant::id.eq(id))
            .first(conn.conn())?;
        Ok(tenant)
    }

    #[tracing::instrument("Tenant::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> DbResult<Self>
    where
        T: Into<TenantIdentifier<'a>>,
    {
        let tenant = Self::query(id.into()).first(conn)?;
        Ok(tenant)
    }

    #[tracing::instrument("Tenant::list_live", skip_all)]
    pub fn list_live(conn: &mut PgConn) -> DbResult<Vec<Self>> {
        let results = tenant::table
            .filter(tenant::sandbox_restricted.eq(false))
            .get_results(conn)?;
        Ok(results)
    }

    /// Save any struct that implements `Insertable<tenant::table>`. The diesel trait constraints
    /// are kind of clunky, but removes the need to have two separate functions with the same exact body
    #[tracing::instrument("Tenant::create", skip_all)]
    pub fn create<T>(conn: &mut TxnPgConn, value: T) -> DbResult<Self>
    where
        T: Insertable<tenant::table>,
        <T as Insertable<tenant::table>>::Values: QueryFragment<Pg> + CanInsertInSingleQuery<Pg> + QueryId,
    {
        let tenant = diesel::insert_into(tenant::table)
            .values(value)
            .get_result::<Self>(conn.conn())?;
        // Atomically create all of the immutable roles needed for the tenant
        let new_roles = [ImmutableRoleKind::Admin, ImmutableRoleKind::ReadOnly]
            .into_iter()
            .flat_map(|irk| {
                let (name, scopes) = irk.props();
                let tenant_id = tenant.id.clone();
                [
                    TenantRoleKind::ApiKey { is_live: true },
                    TenantRoleKind::ApiKey { is_live: false },
                    TenantRoleKind::DashboardUser,
                ]
                .into_iter()
                .map(move |kind| NewTenantRoleRow {
                    tenant_id: tenant_id.clone(),
                    name: name.to_owned(),
                    scopes: scopes.clone(),
                    is_immutable: true,
                    kind: TenantRoleKindDiscriminant::from(&kind),
                    is_live: kind.is_live(),
                    created_at: Utc::now(),
                })
            })
            .collect_vec();
        diesel::insert_into(db_schema::schema::tenant_role::table)
            .values(new_roles)
            .execute(conn.conn())?;
        Ok(tenant)
    }

    #[tracing::instrument("Tenant::update", skip_all)]
    pub fn update(conn: &mut PgConn, id: &TenantId, update_tenant: UpdateTenant) -> DbResult<Self> {
        let result = diesel::update(tenant::table)
            .filter(tenant::id.eq(id))
            .set(update_tenant)
            .get_result(conn)?;

        Ok(result)
    }

    #[tracing::instrument("Tenant::list_by_user_vault_id", skip_all)]
    pub fn list_by_user_vault_id(conn: &mut PgConn, vault_id: &VaultId) -> DbResult<Vec<Tenant>> {
        let res = scoped_vault::table
            .filter(scoped_vault::vault_id.eq(vault_id))
            .inner_join(tenant::table)
            .select(tenant::all_columns)
            .get_results(conn)?;
        Ok(res)
    }

    #[tracing::instrument("Tenant::get_opt_by_workos_org_id", skip_all)]
    pub fn get_opt_by_workos_org_id(conn: &mut PgConn, workos_org_id: &String) -> DbResult<Option<Tenant>> {
        let res = tenant::table
            .filter(tenant::workos_id.eq(workos_org_id))
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("Tenant::get_tenant_by_domain", skip_all)]
    pub fn get_tenant_by_domain(conn: &mut PgConn, domain: &String) -> DbResult<Option<Tenant>> {
        let res = tenant::table
            .filter(tenant::domain.eq(domain))
            .filter(tenant::allow_domain_access.eq(true))
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("Tenant::is_domain_already_claimed", skip_all)]
    /// Returns true if the domain is already claimed
    pub fn is_domain_already_claimed(conn: &mut PgConn, domain: Option<String>) -> DbResult<bool> {
        let result = match domain.as_ref() {
            Some(domain) => Self::get_tenant_by_domain(conn, domain)?.is_some(),
            None => false,
        };
        Ok(result)
    }
}

impl Tenant {
    pub fn supports_auth_method(&self, auth_method: WorkosAuthMethod) -> bool {
        if let Some(auth_methods) = self.supported_auth_methods.as_ref() {
            if !auth_methods.contains(&auth_method) {
                return false;
            }
        }
        true
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, AsChangeset, Default)]
#[diesel(table_name = tenant)]
pub struct UpdateTenant {
    pub name: Option<String>,
    pub logo_url: Option<String>,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
    pub privacy_policy_url: Option<String>,
    pub stripe_customer_id: Option<StripeCustomerId>,
    pub allow_domain_access: Option<bool>,
}

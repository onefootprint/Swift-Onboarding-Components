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
use newtypes::{
    CompanySize, EncryptedVaultPrivateKey, ScopedVaultId, StripeCustomerId, TenantId, VaultId, VaultPublicKey,
};
use serde::{Deserialize, Serialize};

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
    pub fn create<T>(conn: &mut PgConn, value: T) -> DbResult<Self>
    where
        T: Insertable<tenant::table>,
        <T as Insertable<tenant::table>>::Values: QueryFragment<Pg> + CanInsertInSingleQuery<Pg> + QueryId,
    {
        let tenant = diesel::insert_into(tenant::table)
            .values(value)
            .get_result(conn)?;
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
}

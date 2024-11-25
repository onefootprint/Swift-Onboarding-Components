use super::billing_profile::BillingProfile;
use super::tenant_role::ImmutableRoleKind;
use super::tenant_role::TenantRole;
use super::tenant_vendor::TenantVendorControl;
use crate::helpers::WorkosAuthIdentity;
use crate::NonNullVec;
use crate::OptionalNonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::billing_profile;
use db_schema::schema::ob_configuration;
use db_schema::schema::scoped_vault;
use db_schema::schema::tenant::BoxedQuery;
use db_schema::schema::tenant::{
    self,
};
use db_schema::schema::tenant_vendor_control;
use diesel::dsl::count_star;
use diesel::insertable::CanInsertInSingleQuery;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::query_builder::QueryFragment;
use diesel::query_builder::QueryId;
use diesel::Insertable;
use diesel::Queryable;
use itertools::Itertools;
use newtypes::AppClipExperienceId;
use newtypes::CompanySize;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::ObConfigurationId;
use newtypes::PreviewApi;
use newtypes::ScopedVaultId;
use newtypes::StripeCustomerId;
use newtypes::SvixAppId;
use newtypes::TenantId;
use newtypes::TenantKind;
use newtypes::TenantRoleKind;
use newtypes::VaultId;
use newtypes::VaultPublicKey;
use newtypes::WorkosAuthMethod;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Insertable, Selectable)]
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
    // When true, don't allow creating KYC playbooks in prod
    pub is_prod_ob_config_restricted: bool,
    pub allow_domain_access: bool,
    /// When None, any method is allowed. When Some, only specified methods are allowed.
    #[diesel(deserialize_as = OptionalNonNullVec<WorkosAuthMethod>)]
    pub supported_auth_methods: Option<Vec<WorkosAuthMethod>>,
    /// A unique identifier to configure the default tenant app clip experience (autogenerated)
    pub app_clip_experience_id: AppClipExperienceId,
    // When true, don't allow creating KYB playbooks in prod
    pub is_prod_kyb_playbook_restricted: bool,
    /// We only allow specifying a single domain at creation, but additional domains can be added
    /// manually in case the tenant has more than one
    #[diesel(deserialize_as = NonNullVec<String>)]
    pub domains: Vec<String>,
    // When true, don't allow creating auth playbooks in prod
    pub is_prod_auth_playbook_restricted: bool,
    /// Certain preview APIs we want to restrict to only be visible by certain tenants.
    /// Eventually, we'll use this to hide inaccessible preview APIs from docs too
    #[diesel(deserialize_as = NonNullVec<PreviewApi>)]
    pub allowed_preview_apis: Vec<PreviewApi>,
    /// Email that shows in embedded support views
    pub support_email: Option<String>,
    /// Phone number that shows in embedded support views
    pub support_phone: Option<String>,
    /// Website that shows in embedded support views
    pub support_website: Option<String>,
    /// The tenant that this tenant belongs to
    pub super_tenant_id: Option<TenantId>,
    pub svix_app_id_sandbox: Option<SvixAppId>,
    pub svix_app_id_live: Option<SvixAppId>,
}

pub struct PrivateTenantFilters {
    pub search: Option<String>,
    pub is_live: Option<bool>,
    pub only_with_domains: Option<bool>,
}

#[derive(derive_more::From)]
pub enum TenantIdentifier<'a> {
    Id(&'a TenantId),
    ScopedVaultId(&'a ScopedVaultId),
    ObConfigurationId(&'a ObConfigurationId),
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant)]
pub struct NewTenant {
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    /// DEPRECATED
    pub workos_id: Option<String>,
    pub logo_url: Option<String>,
    pub sandbox_restricted: bool,
    pub is_demo_tenant: bool,
    pub is_prod_ob_config_restricted: bool,
    pub is_prod_kyb_playbook_restricted: bool,
    pub is_prod_auth_playbook_restricted: bool,
    pub allow_domain_access: bool,
    pub domains: Vec<String>,
    pub super_tenant_id: Option<TenantId>,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
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
    pub is_prod_kyb_playbook_restricted: bool,
    pub is_prod_auth_playbook_restricted: bool,
    pub allow_domain_access: bool,
    pub domains: Vec<String>,
}

pub struct UserCounts {
    pub live: i64,
    pub sandbox: i64,
}

pub struct TenantWithParent {
    pub tenant: Tenant,
    pub parent: Option<Tenant>,
}

impl From<Tenant> for TenantWithParent {
    fn from(tenant: Tenant) -> Self {
        TenantWithParent { tenant, parent: None }
    }
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
            TenantIdentifier::ObConfigurationId(ob_configuration_id) => {
                let tenant_id = ob_configuration::table
                    .filter(ob_configuration::id.eq(ob_configuration_id))
                    .select(ob_configuration::tenant_id);
                tenant::table.filter(tenant::id.eq_any(tenant_id)).into_boxed()
            }
        }
    }

    #[tracing::instrument("Tenant::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &TenantId) -> FpResult<Self> {
        let tenant = tenant::table
            .for_no_key_update()
            .filter(tenant::id.eq(id))
            .first(conn.conn())?;
        Ok(tenant)
    }

    #[tracing::instrument("Tenant::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> FpResult<Self>
    where
        T: Into<TenantIdentifier<'a>>,
    {
        let tenant = Self::query(id.into()).first(conn)?;
        Ok(tenant)
    }

    #[tracing::instrument("Tenant::list_billable", skip_all)]
    pub fn list_billable(conn: &mut PgConn) -> FpResult<Vec<Self>> {
        let results = tenant::table
            .filter(tenant::sandbox_restricted.eq(false))
            .filter(tenant::super_tenant_id.is_null())
            .get_results::<Self>(conn)?
            .into_iter()
            .filter(|t| !t.id.is_integration_test_tenant() && !t.is_demo_tenant)
            .collect();
        Ok(results)
    }

    #[tracing::instrument("Tenant::private_list", skip_all)]
    pub fn private_list(conn: &mut PgConn, filters: PrivateTenantFilters) -> FpResult<Vec<Self>> {
        let mut query = tenant::table.into_boxed();
        let PrivateTenantFilters {
            search,
            is_live,
            only_with_domains,
        } = filters;

        if let Some(search) = search {
            if search.starts_with("org_") || search.starts_with("_private_it_org") {
                query = query.filter(
                    tenant::id
                        .eq(search.clone())
                        .or(tenant::super_tenant_id.eq(search)),
                );
            } else {
                query = query.filter(tenant::name.ilike(format!("%{}%", search)));
            }
        }
        if let Some(is_live) = is_live {
            query = query.filter(
                tenant::sandbox_restricted
                    .eq(!is_live)
                    .and(tenant::is_demo_tenant.eq(false)),
            );
        }
        let mut results: Vec<Self> = query.get_results(conn)?;

        if let Some(only_with_domains) = only_with_domains {
            // Doing this filter in RAM because the tenant table is pretty small and diesel doesn't
            // have a built-in operator or this
            results.retain(|t| t.domains.is_empty() != only_with_domains);
        }
        Ok(results)
    }

    #[tracing::instrument("Tenant::private_get", skip_all)]
    pub fn private_get(
        conn: &mut PgConn,
        id: &TenantId,
    ) -> FpResult<(Self, Option<BillingProfile>, Option<TenantVendorControl>)> {
        let result = tenant::table
            .filter(tenant::id.eq(id))
            .left_join(billing_profile::table)
            .left_join(tenant_vendor_control::table)
            .filter(tenant_vendor_control::deactivated_at.is_null())
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("Tenant::private_user_counts", skip_all)]
    /// Count the number of vaults that exist for each tenant
    pub fn private_user_counts(conn: &mut PgConn) -> FpResult<HashMap<TenantId, UserCounts>> {
        let results: Vec<((TenantId, bool), i64)> = scoped_vault::table
            .filter(scoped_vault::is_active.eq(true))
            .group_by((scoped_vault::tenant_id, scoped_vault::is_live))
            .select(((scoped_vault::tenant_id, scoped_vault::is_live), count_star()))
            .get_results(conn)?;
        let results = results
            .into_iter()
            .into_group_map_by(|((t_id, _), _)| t_id.clone())
            .into_iter()
            .map(|(t_id, results)| {
                let live = results.iter().filter(|((_, l), _)| *l).map(|(_, c)| c).sum();
                let sandbox = results.iter().filter(|((_, l), _)| !l).map(|(_, c)| c).sum();
                let counts = UserCounts { live, sandbox };
                (t_id, counts)
            })
            .collect();
        Ok(results)
    }

    #[tracing::instrument("Tenant::private_update", skip_all)]
    pub fn private_update(
        conn: &mut TxnPgConn,
        id: &TenantId,
        update: PrivateUpdateTenant,
    ) -> FpResult<Self> {
        if update == Default::default() {
            // Support no-op updates
            let (tenant, _, _) = Self::private_get(conn, id)?;
            return Ok(tenant);
        }
        let result = diesel::update(tenant::table)
            .filter(tenant::id.eq(id))
            .set(update)
            .get_result(conn.conn())?;
        Ok(result)
    }

    /// Save any struct that implements `Insertable<tenant::table>`. The diesel trait constraints
    /// are kind of clunky, but removes the need to have two separate functions with the same exact
    /// body
    #[tracing::instrument("Tenant::create", skip_all)]
    pub fn create<T>(conn: &mut TxnPgConn, value: T) -> FpResult<Self>
    where
        T: Insertable<tenant::table>,
        <T as Insertable<tenant::table>>::Values: QueryFragment<Pg> + CanInsertInSingleQuery<Pg> + QueryId,
    {
        let tenant = diesel::insert_into(tenant::table)
            .values(value)
            .get_result::<Self>(conn.conn())?;

        // Atomically create all of the immutable roles needed for the tenant
        for irk in [ImmutableRoleKind::Admin, ImmutableRoleKind::ReadOnly] {
            let (name, scopes) = irk.props();
            for kind in [
                TenantRoleKind::ApiKey { is_live: true },
                TenantRoleKind::ApiKey { is_live: false },
                TenantRoleKind::DashboardUser,
            ] {
                TenantRole::create(conn, &tenant.id, name, scopes.clone(), true, kind)?;
            }
        }
        Ok(tenant)
    }

    #[tracing::instrument("Tenant::update", skip_all)]
    pub fn update<'a>(conn: &mut PgConn, id: &TenantId, update_tenant: UpdateTenant<'a>) -> FpResult<Self> {
        let result = diesel::update(tenant::table)
            .filter(tenant::id.eq(id))
            .set(update_tenant)
            .get_result(conn)?;

        Ok(result)
    }

    #[tracing::instrument("Tenant::list_by_user_vault_id", skip_all)]
    pub fn list_by_user_vault_id(conn: &mut PgConn, vault_id: &VaultId) -> FpResult<Vec<Tenant>> {
        let res = scoped_vault::table
            .filter(scoped_vault::vault_id.eq(vault_id))
            .inner_join(tenant::table)
            .select(tenant::all_columns)
            .get_results(conn)?;
        Ok(res)
    }

    #[tracing::instrument("Tenant::get_opt_by_workos_org_id", skip_all)]
    pub fn get_opt_by_workos_org_id(conn: &mut PgConn, workos_org_id: &String) -> FpResult<Option<Tenant>> {
        let res = tenant::table
            .filter(tenant::workos_id.eq(workos_org_id))
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("Tenant::get_tenant_by_domain", skip_all)]
    pub fn get_tenant_by_domain(conn: &mut PgConn, domain: &str) -> FpResult<Option<Tenant>> {
        let res = tenant::table
            .filter(tenant::domains.contains(vec![domain]))
            .filter(tenant::allow_domain_access.eq(true))
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("Tenant::is_domain_already_claimed", skip_all)]
    /// Returns true if the domain is already claimed
    pub fn is_domain_already_claimed(conn: &mut PgConn, domains: &Vec<String>) -> FpResult<bool> {
        let result = if !domains.is_empty() {
            let existing: Option<TenantId> = tenant::table
                .filter(tenant::domains.overlaps_with(domains))
                .filter(tenant::allow_domain_access.eq(true))
                .select(tenant::id)
                .first(conn)
                .optional()?;
            existing.is_some()
        } else {
            false
        };
        Ok(result)
    }

    #[tracing::instrument("Tenant::get_with_parent", skip_all)]
    pub fn with_parent(self, conn: &mut PgConn) -> FpResult<TenantWithParent> {
        let parent = if let Some(super_tenant_id) = &self.super_tenant_id {
            let parent = Tenant::get(conn, TenantIdentifier::Id(super_tenant_id))?;
            Some(parent)
        } else {
            None
        };
        Ok(TenantWithParent { tenant: self, parent })
    }

    #[tracing::instrument("Tenant::list_childre", skip_all)]
    pub fn list_children(conn: &mut PgConn, id: &TenantId) -> FpResult<Vec<Self>> {
        let results = tenant::table
            .filter(tenant::super_tenant_id.eq(id))
            .get_results::<Self>(conn)?;
        Ok(results)
    }

    pub fn set_svix_app_id(
        conn: &mut PgConn,
        id: &TenantId,
        is_live: bool,
        app_id: &SvixAppId,
    ) -> FpResult<Self> {
        let update = UpdateTenant {
            svix_app_id_sandbox: (!is_live).then_some(app_id),
            svix_app_id_live: (is_live).then_some(app_id),
            ..Default::default()
        };
        Self::update(conn, id, update)
    }

    pub fn can_access_preview(&self, api: &PreviewApi) -> bool {
        self.is_demo_tenant || self.allowed_preview_apis.contains(api)
    }
}

impl WorkosAuthIdentity for Tenant {
    fn supports_auth_method(&self, auth_method: WorkosAuthMethod) -> bool {
        if let Some(auth_methods) = self.supported_auth_methods.as_ref() {
            if !auth_methods.contains(&auth_method) {
                return false;
            }
        }
        true
    }
}

impl From<&Tenant> for TenantKind {
    fn from(_: &Tenant) -> Self {
        TenantKind::Tenant
    }
}

#[derive(Debug, Clone, AsChangeset, Default, PartialEq)]
#[diesel(table_name = tenant)]
pub struct UpdateTenant<'a> {
    pub name: Option<String>,
    pub logo_url: Option<String>,
    pub website_url: Option<String>,
    pub company_size: Option<CompanySize>,
    pub privacy_policy_url: Option<String>,
    pub stripe_customer_id: Option<StripeCustomerId>,
    pub allow_domain_access: Option<bool>,
    pub support_email: Option<Option<String>>,
    pub support_phone: Option<Option<String>>,
    pub support_website: Option<Option<String>>,
    pub svix_app_id_sandbox: Option<&'a SvixAppId>,
    pub svix_app_id_live: Option<&'a SvixAppId>,
}

#[derive(Debug, Clone, AsChangeset, Default, PartialEq)]
#[diesel(table_name = tenant)]
pub struct PrivateUpdateTenant {
    pub name: Option<String>,

    pub domains: Option<Vec<String>>,
    pub allow_domain_access: Option<bool>,

    pub sandbox_restricted: Option<bool>,
    pub is_prod_ob_config_restricted: Option<bool>,
    pub is_prod_kyb_playbook_restricted: Option<bool>,
    pub is_prod_auth_playbook_restricted: Option<bool>,

    pub supported_auth_methods: Option<Option<Vec<WorkosAuthMethod>>>,
    pub allowed_preview_apis: Option<Vec<PreviewApi>>,
    pub pinned_api_version: Option<Option<i32>>,
    pub is_demo_tenant: Option<bool>,

    pub super_tenant_id: Option<Option<TenantId>>,
}

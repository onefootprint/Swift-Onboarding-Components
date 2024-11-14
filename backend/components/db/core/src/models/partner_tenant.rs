use super::tenant_role::ImmutableRoleKind;
use super::tenant_role::TenantRole;
use crate::helpers::WorkosAuthIdentity;
use crate::NonNullVec;
use crate::OptionalNonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::partner_tenant;
use diesel::insertable::CanInsertInSingleQuery;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::query_builder::QueryFragment;
use diesel::query_builder::QueryId;
use diesel::Insertable;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::PartnerTenantId;
use newtypes::TenantKind;
use newtypes::TenantRoleKind;
use newtypes::VaultPublicKey;
use newtypes::WorkosAuthMethod;

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = partner_tenant)]
pub struct PartnerTenant {
    pub id: PartnerTenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    #[diesel(deserialize_as = OptionalNonNullVec<WorkosAuthMethod>)]
    pub supported_auth_methods: Option<Vec<WorkosAuthMethod>>,
    #[diesel(deserialize_as = NonNullVec<String>)]
    pub domains: Vec<String>,
    pub allow_domain_access: bool,
    pub logo_url: Option<String>,
    pub website_url: Option<String>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = partner_tenant)]
pub struct NewPartnerTenant {
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub supported_auth_methods: Option<Vec<WorkosAuthMethod>>,
    pub domains: Vec<String>,
    pub allow_domain_access: bool,
    pub logo_url: Option<String>,
    pub website_url: Option<String>,
}

#[derive(Debug, Clone, AsChangeset, Default, PartialEq)]
#[diesel(table_name = partner_tenant)]
pub struct UpdatePartnerTenant {
    pub name: Option<String>,
    pub logo_url: Option<String>,
    pub website_url: Option<String>,
    pub allow_domain_access: Option<bool>,
}

/// Allows creating with an application-generated PartnerTenantId rather than a DB-generated ID.
#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = partner_tenant)]
pub struct NewIntegrationTestPartnerTenant {
    pub id: PartnerTenantId,
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub supported_auth_methods: Option<Vec<WorkosAuthMethod>>,
    pub domains: Vec<String>,
    pub allow_domain_access: bool,
    pub logo_url: Option<String>,
    pub website_url: Option<String>,
}

impl PartnerTenant {
    #[tracing::instrument("PartnerTenant::create", skip_all)]
    pub fn create<T>(conn: &mut TxnPgConn, value: T) -> FpResult<PartnerTenant>
    where
        T: Insertable<partner_tenant::table>,
        <T as Insertable<partner_tenant::table>>::Values:
            QueryFragment<Pg> + CanInsertInSingleQuery<Pg> + QueryId,
    {
        let partner_tenant: PartnerTenant = diesel::insert_into(partner_tenant::table)
            .values(value)
            .get_result(conn.conn())?;

        // Atomically create all of the immutable roles needed for the partner tenant.
        for irk in [
            ImmutableRoleKind::CompliancePartnerAdmin,
            ImmutableRoleKind::CompliancePartnerReadOnly,
        ] {
            let (name, scopes) = irk.props();
            TenantRole::create(
                conn,
                &partner_tenant.id,
                name,
                scopes,
                true,
                TenantRoleKind::CompliancePartnerDashboardUser,
            )?;
        }

        Ok(partner_tenant)
    }

    #[tracing::instrument("PartnerTenant::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &PartnerTenantId) -> FpResult<Self> {
        let pt = partner_tenant::table
            .for_no_key_update()
            .filter(partner_tenant::id.eq(id))
            .select(PartnerTenant::as_select())
            .first(conn.conn())?;
        Ok(pt)
    }

    #[tracing::instrument("PartnerTenant::update", skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        id: &PartnerTenantId,
        update_pt: UpdatePartnerTenant,
    ) -> FpResult<Self> {
        if update_pt == UpdatePartnerTenant::default() {
            return PartnerTenant::lock(conn, id);
        }

        let result = diesel::update(partner_tenant::table)
            .filter(partner_tenant::id.eq(id))
            .set(update_pt)
            .get_result(conn.conn())?;

        Ok(result)
    }

    #[tracing::instrument("PartnerTenant::get_by_domain", skip_all)]
    pub fn get_by_domain(conn: &mut PgConn, domain: &str) -> FpResult<Option<Self>> {
        let res = partner_tenant::table
            .filter(partner_tenant::domains.contains(vec![domain]))
            .filter(partner_tenant::allow_domain_access.eq(true))
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("PartnerTenant::is_domain_already_claimed", skip_all)]
    /// Returns true if the domain is already claimed
    pub fn is_domain_already_claimed(conn: &mut PgConn, domains: &Vec<String>) -> FpResult<bool> {
        let result = if !domains.is_empty() {
            let existing: Option<PartnerTenantId> = partner_tenant::table
                .filter(partner_tenant::domains.overlaps_with(domains))
                .filter(partner_tenant::allow_domain_access.eq(true))
                .select(partner_tenant::id)
                .first(conn)
                .optional()?;
            existing.is_some()
        } else {
            false
        };
        Ok(result)
    }
}

impl WorkosAuthIdentity for PartnerTenant {
    fn supports_auth_method(&self, auth_method: WorkosAuthMethod) -> bool {
        if let Some(auth_methods) = self.supported_auth_methods.as_ref() {
            if !auth_methods.contains(&auth_method) {
                return false;
            }
        }
        true
    }
}

impl From<&PartnerTenant> for TenantKind {
    fn from(_: &PartnerTenant) -> Self {
        TenantKind::PartnerTenant
    }
}

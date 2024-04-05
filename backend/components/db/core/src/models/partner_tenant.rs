use super::tenant_role::{ImmutableRoleKind, TenantRole};
use crate::{helpers::WorkosAuthIdentity, DbResult, NonNullVec, OptionalNonNullVec, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::partner_tenant;
use diesel::{
    insertable::CanInsertInSingleQuery,
    pg::Pg,
    prelude::*,
    query_builder::{QueryFragment, QueryId},
    Insertable,
};
use newtypes::{
    EncryptedVaultPrivateKey, PartnerTenantId, TenantKind, TenantRoleKind, VaultPublicKey, WorkosAuthMethod,
};

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

#[derive(Debug, Clone, AsChangeset, Default)]
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
    pub fn create<T>(conn: &mut TxnPgConn, value: T) -> DbResult<PartnerTenant>
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
    pub fn lock(conn: &mut TxnPgConn, id: &PartnerTenantId) -> DbResult<Self> {
        let pt = partner_tenant::table
            .for_no_key_update()
            .filter(partner_tenant::id.eq(id))
            .first(conn.conn())?;
        Ok(pt)
    }

    #[tracing::instrument("PartnerTenant::update", skip_all)]
    pub fn update(conn: &mut PgConn, id: &PartnerTenantId, update_pt: UpdatePartnerTenant) -> DbResult<Self> {
        let result = diesel::update(partner_tenant::table)
            .filter(partner_tenant::id.eq(id))
            .set(update_pt)
            .get_result(conn)?;

        Ok(result)
    }

    #[tracing::instrument("PartnerTenant::get_by_domain", skip_all)]
    pub fn get_by_domain(conn: &mut PgConn, domain: &str) -> DbResult<Option<Self>> {
        let res = partner_tenant::table
            .filter(partner_tenant::domains.contains(vec![domain]))
            .filter(partner_tenant::allow_domain_access.eq(true))
            .first(conn)
            .optional()?;
        Ok(res)
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

use super::tenant_role::{ImmutableRoleKind, TenantRole};
use crate::{DbResult, NonNullVec, OptionalNonNullVec, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::partner_tenant;
use diesel::prelude::*;
use newtypes::{EncryptedVaultPrivateKey, PartnerTenantId, TenantRoleKind, VaultPublicKey, WorkosAuthMethod};

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
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = partner_tenant)]
pub struct NewPartnerTenant {
    pub name: String,
    pub public_key: VaultPublicKey,
    pub e_private_key: EncryptedVaultPrivateKey,
    pub supported_auth_methods: Option<Vec<WorkosAuthMethod>>,
    pub domains: Vec<String>,
}

impl NewPartnerTenant {
    #[tracing::instrument("NewPartnerTenant::create", skip_all)]
    pub fn create(self, conn: &mut TxnPgConn) -> DbResult<PartnerTenant> {
        let partner_tenant: PartnerTenant = diesel::insert_into(partner_tenant::table)
            .values(self)
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
}

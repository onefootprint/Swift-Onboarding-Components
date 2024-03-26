use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::tenant_compliance_partnership;
use diesel::prelude::*;
use newtypes::{PartnerTenantId, TenantCompliancePartnershipId, TenantId};
use serde::Serialize;

#[derive(Debug, Clone, Hash, PartialEq, Eq, Queryable, Selectable, Identifiable, Serialize)]
#[diesel(table_name = tenant_compliance_partnership)]
#[diesel(primary_key(tenant_id, partner_tenant_id))]
pub struct TenantCompliancePartnership {
    pub id: TenantCompliancePartnershipId,

    pub tenant_id: TenantId,
    pub partner_tenant_id: PartnerTenantId,

    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_compliance_partnership)]
pub struct NewTenantCompliancePartnership<'a> {
    pub tenant_id: &'a TenantId,
    pub partner_tenant_id: &'a PartnerTenantId,
}

pub type IsNew = bool;

impl<'a> NewTenantCompliancePartnership<'a> {
    #[tracing::instrument("NewTenantCompliancePartnership::get_or_create", skip_all)]
    pub fn get_or_create(self, conn: &mut TxnPgConn) -> DbResult<(TenantCompliancePartnership, IsNew)> {
        let existing: Option<TenantCompliancePartnership> = tenant_compliance_partnership::table
            .filter(tenant_compliance_partnership::tenant_id.eq(self.tenant_id))
            .filter(tenant_compliance_partnership::partner_tenant_id.eq(self.partner_tenant_id))
            .select(TenantCompliancePartnership::as_select())
            .first(conn.conn())
            .optional()?;
        if let Some(p) = existing {
            return Ok((p, false));
        }

        let p = diesel::insert_into(tenant_compliance_partnership::table)
            .values(self)
            .get_result(conn.conn())?;
        Ok((p, true))
    }
}

impl TenantCompliancePartnership {
    pub fn get(
        conn: &mut TxnPgConn,
        id: &TenantCompliancePartnershipId,
        pt_id: &PartnerTenantId,
    ) -> DbResult<TenantCompliancePartnership> {
        Ok(tenant_compliance_partnership::table
            .filter(tenant_compliance_partnership::id.eq(id))
            .filter(tenant_compliance_partnership::partner_tenant_id.eq(pt_id))
            .select(TenantCompliancePartnership::as_select())
            .first(conn.conn())?)
    }
}

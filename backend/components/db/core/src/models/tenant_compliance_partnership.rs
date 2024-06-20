use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_compliance_partnership;
use diesel::prelude::*;
use newtypes::OrgIdentifierRef;
use newtypes::PartnerTenantId;
use newtypes::TenantCompliancePartnershipId;
use newtypes::TenantId;

#[derive(Debug, Clone, Hash, PartialEq, Eq, Queryable, Selectable, Identifiable)]
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
    pub fn get<'a>(
        conn: &mut PgConn,
        id: &TenantCompliancePartnershipId,
        org_id: impl Into<OrgIdentifierRef<'a>>,
    ) -> DbResult<TenantCompliancePartnership> {
        let query = tenant_compliance_partnership::table
            .filter(tenant_compliance_partnership::id.eq(id))
            .into_boxed();

        let org_id: OrgIdentifierRef<'a> = org_id.into();
        let query = match org_id {
            OrgIdentifierRef::TenantId(t_id) => {
                query.filter(tenant_compliance_partnership::tenant_id.eq(t_id))
            }
            OrgIdentifierRef::PartnerTenantId(pt_id) => {
                query.filter(tenant_compliance_partnership::partner_tenant_id.eq(pt_id))
            }
        };

        Ok(query
            .select(TenantCompliancePartnership::as_select())
            .first(conn)?)
    }
}

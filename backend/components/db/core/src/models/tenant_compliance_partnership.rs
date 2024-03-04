use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::tenant_compliance_partnership;
use diesel::prelude::*;
use newtypes::{PartnerTenantId, TenantCompliancePartnershipId, TenantId};

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

impl<'a> NewTenantCompliancePartnership<'a> {
    #[tracing::instrument("NewTenantCompliancePartnership::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<TenantCompliancePartnership> {
        Ok(diesel::insert_into(tenant_compliance_partnership::table)
            .values(self)
            .get_result(conn)?)
    }
}

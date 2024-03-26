use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc;
use diesel::prelude::*;
use newtypes::{ComplianceDocId, ComplianceDocTemplateId, TenantCompliancePartnershipId};

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc)]
pub struct ComplianceDoc {
    pub id: ComplianceDocId,

    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub tenant_compliance_partnership_id: TenantCompliancePartnershipId,

    // None if this is an ad-hoc request.
    pub template_id: Option<ComplianceDocTemplateId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc)]
pub struct NewComplianceDoc<'a> {
    pub tenant_compliance_partnership_id: &'a TenantCompliancePartnershipId,
    pub template_id: Option<&'a ComplianceDocTemplateId>,
}

impl<'a> NewComplianceDoc<'a> {
    #[tracing::instrument("NewComplianceDoc::create", skip_all)]
    pub fn create(self, conn: &mut TxnPgConn) -> DbResult<ComplianceDoc> {
        Ok(diesel::insert_into(compliance_doc::table)
            .values(self)
            .get_result(conn.conn())?)
    }
}

impl ComplianceDoc {
    pub fn get(
        conn: &mut TxnPgConn,
        id: &ComplianceDocId,
        partnership_id: &TenantCompliancePartnershipId,
    ) -> DbResult<ComplianceDoc> {
        Ok(compliance_doc::table
            .filter(compliance_doc::id.eq(id))
            .filter(compliance_doc::tenant_compliance_partnership_id.eq(partnership_id))
            .first(conn.conn())?)
    }
}

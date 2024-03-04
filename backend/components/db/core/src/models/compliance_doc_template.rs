use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc_template;
use diesel::prelude::*;
use newtypes::{ComplianceDocTemplateId, PartnerTenantId};

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc_template)]
pub struct ComplianceDocTemplate {
    pub id: ComplianceDocTemplateId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub partner_tenant_id: PartnerTenantId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_template)]
pub struct NewComplianceDocTemplate<'a> {
    pub partner_tenant_id: &'a PartnerTenantId,
}

impl<'a> NewComplianceDocTemplate<'a> {
    #[tracing::instrument("NewComplianceDocTemplate::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<ComplianceDocTemplate> {
        Ok(diesel::insert_into(compliance_doc_template::table)
            .values(self)
            .get_result(conn)?)
    }
}

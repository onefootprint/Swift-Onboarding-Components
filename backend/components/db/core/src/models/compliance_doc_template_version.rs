use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc_template_version;
use diesel::prelude::*;
use newtypes::{ComplianceDocTemplateId, ComplianceDocTemplateVersionId, TenantUserId};

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc_template_version)]
pub struct ComplianceDocTemplateVersion {
    pub id: ComplianceDocTemplateVersionId,

    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub created_by_partner_tenant_user_id: TenantUserId,
    pub template_id: ComplianceDocTemplateId,

    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_template_version)]
pub struct NewComplianceDocTemplateVersion<'a> {
    pub created_at: DateTime<Utc>,
    pub created_by_partner_tenant_user_id: &'a TenantUserId,
    pub template_id: &'a ComplianceDocTemplateId,
    pub name: &'a str,
    pub description: &'a str,
}

impl<'a> NewComplianceDocTemplateVersion<'a> {
    #[tracing::instrument("NewComplianceDocTemplateVersion::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<ComplianceDocTemplateVersion> {
        Ok(diesel::insert_into(compliance_doc_template_version::table)
            .values(self)
            .get_result(conn)?)
    }
}

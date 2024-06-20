use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::compliance_doc_template;
use db_schema::schema::compliance_doc_template_version;
use diesel::prelude::*;
use newtypes::ComplianceDocTemplateId;
use newtypes::ComplianceDocTemplateVersionId;
use newtypes::PartnerTenantId;
use newtypes::TenantUserId;

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc_template_version)]
pub struct ComplianceDocTemplateVersion {
    pub id: ComplianceDocTemplateVersionId,

    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub created_by_partner_tenant_user_id: Option<TenantUserId>,
    pub template_id: ComplianceDocTemplateId,

    pub name: String,
    pub description: String,

    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_template_version)]
pub struct NewComplianceDocTemplateVersion<'a> {
    pub created_at: DateTime<Utc>,
    pub created_by_partner_tenant_user_id: Option<&'a TenantUserId>,
    pub template_id: &'a ComplianceDocTemplateId,
    pub name: &'a str,
    pub description: &'a str,
}

impl ComplianceDocTemplateVersion {
    #[tracing::instrument("ComplianceDocTemplateVersion::create", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        id: &ComplianceDocTemplateVersionId,
        pt_id: &PartnerTenantId,
    ) -> DbResult<ComplianceDocTemplateVersion> {
        Ok(compliance_doc_template::table
            .inner_join(compliance_doc_template_version::table)
            .filter(compliance_doc_template_version::id.eq(id))
            .filter(compliance_doc_template::partner_tenant_id.eq(pt_id))
            .select(ComplianceDocTemplateVersion::as_select())
            .first(conn)?)
    }
}

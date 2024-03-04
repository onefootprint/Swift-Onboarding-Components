use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc_request;
use diesel::prelude::*;
use newtypes::{
    ComplianceDocRequestId, ComplianceDocTemplateVersionId, TenantCompliancePartnershipId, TenantUserId,
};


#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc_request)]
pub struct ComplianceDocRequest {
    pub id: ComplianceDocRequestId,

    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,

    pub name: String,
    pub description: String,

    // None if this is an ad-hoc request.
    pub template_version_id: Option<ComplianceDocTemplateVersionId>,

    pub tenant_compliance_partnership_id: TenantCompliancePartnershipId,
    pub requested_by_partner_tenant_user_id: TenantUserId,
    pub assigned_to_tenant_user_id: Option<TenantUserId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_request)]
pub struct NewComplianceDocRequest<'a> {
    pub created_at: DateTime<Utc>,

    pub name: &'a str,
    pub description: &'a str,

    pub template_version_id: Option<&'a ComplianceDocTemplateVersionId>,

    pub tenant_compliance_partnership_id: &'a TenantCompliancePartnershipId,
    pub requested_by_partner_tenant_user_id: &'a TenantUserId,
    pub assigned_to_tenant_user_id: Option<&'a TenantUserId>,
}

impl<'a> NewComplianceDocRequest<'a> {
    #[tracing::instrument("NewComplianceDocRequest::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<ComplianceDocRequest> {
        Ok(diesel::insert_into(compliance_doc_request::table)
            .values(self)
            .get_result(conn)?)
    }
}

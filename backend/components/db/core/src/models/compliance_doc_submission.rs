use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc_submission;
use diesel::prelude::*;
use newtypes::{ComplianceDocData, ComplianceDocRequestId, ComplianceDocSubmissionId, TenantUserId};


#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc_submission)]
pub struct ComplianceDocSubmission {
    pub id: ComplianceDocSubmissionId,

    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub request_id: ComplianceDocRequestId,
    pub submitted_by_tenant_user_id: TenantUserId,
    pub assigned_to_partner_tenant_user_id: Option<TenantUserId>,
    pub doc_data: ComplianceDocData,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_submission)]
pub struct NewComplianceDocSubmission<'a> {
    pub created_at: DateTime<Utc>,

    pub request_id: &'a ComplianceDocRequestId,
    pub submitted_by_tenant_user_id: &'a TenantUserId,
    pub assigned_to_partner_tenant_user_id: Option<&'a TenantUserId>,
    pub doc_data: &'a ComplianceDocData,
}

impl<'a> NewComplianceDocSubmission<'a> {
    #[tracing::instrument("NewComplianceDocSubmission::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<ComplianceDocSubmission> {
        Ok(diesel::insert_into(compliance_doc_submission::table)
            .values(self)
            .get_result(conn)?)
    }
}

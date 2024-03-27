use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc_review;
use diesel::prelude::*;
use newtypes::{
    ComplianceDocReviewDecision, ComplianceDocReviewId, ComplianceDocSubmissionId, Locked, TenantUserId,
};

use super::compliance_doc::ComplianceDoc;


#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc_review)]
pub struct ComplianceDocReview {
    pub id: ComplianceDocReviewId,

    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub submission_id: ComplianceDocSubmissionId,
    pub reviewed_by_partner_tenant_user_id: TenantUserId,

    pub decision: ComplianceDocReviewDecision,
    pub note: String,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_review)]
pub struct NewComplianceDocReview<'a> {
    pub created_at: DateTime<Utc>,

    pub submission_id: &'a ComplianceDocSubmissionId,
    pub reviewed_by_partner_tenant_user_id: &'a TenantUserId,

    pub decision: ComplianceDocReviewDecision,
    pub note: &'a str,
}

impl<'a> NewComplianceDocReview<'a> {
    #[tracing::instrument("NewComplianceDocReview::create", skip_all)]
    pub fn create(self, conn: &mut PgConn, _lock: &Locked<ComplianceDoc>) -> DbResult<ComplianceDocReview> {
        Ok(diesel::insert_into(compliance_doc_review::table)
            .values(self)
            .get_result(conn)?)
    }
}

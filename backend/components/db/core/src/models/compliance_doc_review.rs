use crate::{DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc_review;
use diesel::prelude::*;
use newtypes::{
    ComplianceDocId, ComplianceDocReviewDecision, ComplianceDocReviewId, ComplianceDocSubmissionId, Locked,
    TenantUserId,
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

    pub deactivated_at: Option<DateTime<Utc>>,
    pub compliance_doc_id: ComplianceDocId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_review)]
pub struct NewComplianceDocReview<'a> {
    pub created_at: DateTime<Utc>,

    pub submission_id: &'a ComplianceDocSubmissionId,
    pub reviewed_by_partner_tenant_user_id: &'a TenantUserId,

    pub decision: ComplianceDocReviewDecision,
    pub note: &'a str,
    pub compliance_doc_id: &'a ComplianceDocId,
}

impl<'a> NewComplianceDocReview<'a> {
    #[tracing::instrument("NewComplianceDocReview::create", skip_all)]
    pub fn create(self, conn: &mut TxnPgConn, doc: &Locked<ComplianceDoc>) -> DbResult<ComplianceDocReview> {
        if doc.id != *self.compliance_doc_id {
            return Err(DbError::AssertionError(
                "locked document does not match new review".to_string(),
            ));
        }

        // Deactivate any existing review.
        if let Some(prev_rev) = ComplianceDocReview::get_active(conn, doc)? {
            ComplianceDocReview::deactivate(conn, &prev_rev.id, doc)?;
        }

        Ok(diesel::insert_into(compliance_doc_review::table)
            .values(self)
            .get_result(conn.conn())?)
    }
}


impl ComplianceDocReview {
    #[tracing::instrument("ComplianceDocReview::get_active", skip_all)]
    pub fn get_active(
        conn: &mut TxnPgConn,
        doc: &Locked<ComplianceDoc>,
    ) -> DbResult<Option<ComplianceDocReview>> {
        Ok(compliance_doc_review::table
            .filter(compliance_doc_review::compliance_doc_id.eq(&doc.id))
            .filter(compliance_doc_review::deactivated_at.is_null())
            .select(ComplianceDocReview::as_select())
            .first(conn.conn())
            .optional()?)
    }

    #[tracing::instrument("ComplianceDocReview::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        rev_id: &ComplianceDocReviewId,
        doc: &Locked<ComplianceDoc>,
    ) -> DbResult<()> {
        diesel::update(compliance_doc_review::table)
            .filter(compliance_doc_review::id.eq(rev_id))
            .filter(compliance_doc_review::compliance_doc_id.eq(&doc.id))
            .filter(compliance_doc_review::deactivated_at.is_null())
            .set(compliance_doc_review::deactivated_at.eq(Some(Utc::now())))
            .execute(conn.conn())?;

        Ok(())
    }
}

use super::{compliance_doc::ComplianceDoc, compliance_doc_review::ComplianceDocReview};
use crate::{DbError, DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc_submission;
use diesel::prelude::*;
use newtypes::{
    ComplianceDocData, ComplianceDocId, ComplianceDocRequestId, ComplianceDocSubmissionId, Locked,
    TenantUserId,
};

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc_submission)]
pub struct ComplianceDocSubmission {
    pub id: ComplianceDocSubmissionId,

    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub request_id: ComplianceDocRequestId,
    pub submitted_by_tenant_user_id: TenantUserId,
    pub doc_data: ComplianceDocData,

    pub deactivated_at: Option<DateTime<Utc>>,
    pub compliance_doc_id: ComplianceDocId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_submission)]
pub struct NewComplianceDocSubmission<'a> {
    pub created_at: DateTime<Utc>,

    pub request_id: &'a ComplianceDocRequestId,
    pub submitted_by_tenant_user_id: &'a TenantUserId,
    pub doc_data: &'a ComplianceDocData,
    pub compliance_doc_id: &'a ComplianceDocId,
}

impl<'a> NewComplianceDocSubmission<'a> {
    #[tracing::instrument("NewComplianceDocSubmission::create", skip_all)]
    pub fn create(
        self,
        conn: &mut TxnPgConn,
        doc: &Locked<ComplianceDoc>,
    ) -> DbResult<ComplianceDocSubmission> {
        if doc.id != *self.compliance_doc_id {
            return Err(DbError::AssertionError(
                "locked document does not match new submission".to_string(),
            ));
        }

        // Deactivate any existing submission and review.
        if let Some(prev_sub) = ComplianceDocSubmission::get_active(conn, doc)? {
            ComplianceDocSubmission::deactivate(conn, &prev_sub.id, doc)?;
        }
        if let Some(prev_rev) = ComplianceDocReview::get_active(conn, doc)? {
            ComplianceDocReview::deactivate(conn, &prev_rev.id, doc)?;
        }

        Ok(diesel::insert_into(compliance_doc_submission::table)
            .values(self)
            .get_result(conn.conn())?)
    }
}

impl ComplianceDocSubmission {
    #[tracing::instrument("ComplianceDocSubmission::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        id: &ComplianceDocSubmissionId,
        doc_id: &ComplianceDocId,
    ) -> DbResult<ComplianceDocSubmission> {
        Ok(compliance_doc_submission::table
            .filter(compliance_doc_submission::id.eq(id))
            .filter(compliance_doc_submission::compliance_doc_id.eq(doc_id))
            .select(ComplianceDocSubmission::as_select())
            .first(conn)?)
    }

    #[tracing::instrument("ComplianceDocSubmission::get_active", skip_all)]
    pub fn get_active(
        conn: &mut TxnPgConn,
        doc: &Locked<ComplianceDoc>,
    ) -> DbResult<Option<ComplianceDocSubmission>> {
        Ok(compliance_doc_submission::table
            .filter(compliance_doc_submission::compliance_doc_id.eq(&doc.id))
            .filter(compliance_doc_submission::deactivated_at.is_null())
            .select(ComplianceDocSubmission::as_select())
            .first(conn.conn())
            .optional()?)
    }

    #[tracing::instrument("ComplianceDocSubmission::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        sub_id: &ComplianceDocSubmissionId,
        doc: &Locked<ComplianceDoc>,
    ) -> DbResult<()> {
        diesel::update(compliance_doc_submission::table)
            .filter(compliance_doc_submission::id.eq(sub_id))
            .filter(compliance_doc_submission::compliance_doc_id.eq(&doc.id))
            .filter(compliance_doc_submission::deactivated_at.is_null())
            .set(compliance_doc_submission::deactivated_at.eq(Some(Utc::now())))
            .execute(conn.conn())?;

        Ok(())
    }
}

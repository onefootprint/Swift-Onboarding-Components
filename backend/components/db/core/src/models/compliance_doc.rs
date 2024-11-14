use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::compliance_doc;
use db_schema::schema::compliance_doc_request;
use db_schema::schema::compliance_doc_review;
use db_schema::schema::compliance_doc_submission;
use diesel::prelude::*;
use newtypes::ComplianceDocId;
use newtypes::ComplianceDocRequestId;
use newtypes::ComplianceDocReviewId;
use newtypes::ComplianceDocSubmissionId;
use newtypes::ComplianceDocTemplateId;
use newtypes::Locked;
use newtypes::TenantCompliancePartnershipId;

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
    pub fn create(self, conn: &mut TxnPgConn) -> DbResult<Locked<ComplianceDoc>> {
        let doc = diesel::insert_into(compliance_doc::table)
            .values(self)
            .get_result(conn.conn())?;
        Ok(Locked::new(doc))
    }
}

#[derive(Debug, Clone, Copy, derive_more::From)]
pub enum ComplianceDocIdentifier<'a> {
    ComplianceDocId(&'a ComplianceDocId),
    ComplianceDocRequestId(&'a ComplianceDocRequestId),
    ComplianceDocSubmissionId(&'a ComplianceDocSubmissionId),
    ComplianceDocReviewId(&'a ComplianceDocReviewId),
}

impl<'a> ComplianceDocIdentifier<'a> {
    pub fn get_doc_id(&self, conn: &mut PgConn) -> DbResult<ComplianceDocId> {
        let doc_id = match *self {
            ComplianceDocIdentifier::ComplianceDocId(id) => id.clone(),
            ComplianceDocIdentifier::ComplianceDocRequestId(request_id) => compliance_doc_request::table
                .filter(compliance_doc_request::id.eq(request_id))
                .select(compliance_doc_request::compliance_doc_id)
                .first(conn)?,
            ComplianceDocIdentifier::ComplianceDocSubmissionId(submission_id) => {
                compliance_doc_submission::table
                    .filter(compliance_doc_submission::id.eq(submission_id))
                    .select(compliance_doc_submission::compliance_doc_id)
                    .first(conn)?
            }
            ComplianceDocIdentifier::ComplianceDocReviewId(review_id) => compliance_doc_review::table
                .filter(compliance_doc_review::id.eq(review_id))
                .select(compliance_doc_review::compliance_doc_id)
                .first(conn)?,
        };
        Ok(doc_id)
    }
}

impl ComplianceDoc {
    #[tracing::instrument("ComplianceDoc::get", skip_all)]
    pub fn get<'a>(
        conn: &mut PgConn,
        id: impl Into<ComplianceDocIdentifier<'a>>,
        partnership_id: &TenantCompliancePartnershipId,
    ) -> DbResult<ComplianceDoc> {
        let id: ComplianceDocIdentifier<'a> = id.into();
        let doc_id = id.get_doc_id(conn)?;

        let doc = compliance_doc::table
            .filter(compliance_doc::id.eq(doc_id))
            .filter(compliance_doc::tenant_compliance_partnership_id.eq(partnership_id))
            .select(ComplianceDoc::as_select())
            .first(conn)?;

        Ok(doc)
    }

    #[tracing::instrument("ComplianceDoc::lock", skip_all)]
    pub fn lock<'a>(
        conn: &mut TxnPgConn,
        id: impl Into<ComplianceDocIdentifier<'a>>,
        partnership_id: &TenantCompliancePartnershipId,
    ) -> DbResult<Locked<ComplianceDoc>> {
        let id: ComplianceDocIdentifier<'a> = id.into();
        let doc_id = id.get_doc_id(conn.conn())?;

        let doc = compliance_doc::table
            .filter(compliance_doc::id.eq(doc_id))
            .filter(compliance_doc::tenant_compliance_partnership_id.eq(partnership_id))
            .for_no_key_update()
            .select(ComplianceDoc::as_select())
            .first(conn.conn())?;

        Ok(Locked::new(doc))
    }
}

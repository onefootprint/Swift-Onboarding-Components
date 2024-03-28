use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc_request;
use diesel::prelude::*;
use newtypes::{ComplianceDocId, ComplianceDocRequestId, Locked, TenantUserId};

use super::compliance_doc::ComplianceDoc;


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

    pub requested_by_partner_tenant_user_id: TenantUserId,

    pub compliance_doc_id: ComplianceDocId,

    pub deactivated_by_partner_tenant_user_id: Option<TenantUserId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_request)]
pub struct NewComplianceDocRequest<'a> {
    pub created_at: DateTime<Utc>,

    pub name: &'a str,
    pub description: &'a str,

    pub requested_by_partner_tenant_user_id: &'a TenantUserId,

    pub compliance_doc_id: &'a ComplianceDocId,
}

impl<'a> NewComplianceDocRequest<'a> {
    #[tracing::instrument("NewComplianceDocRequest::create", skip_all)]
    pub fn create(self, conn: &mut TxnPgConn, doc: &Locked<ComplianceDoc>) -> DbResult<ComplianceDocRequest> {
        // Deactivate existing request if one exists.
        if let Some(prev_req) = ComplianceDocRequest::get_active(conn, doc)? {
            ComplianceDocRequest::deactivate(conn, &prev_req.id, None, doc)?;
        }

        Ok(diesel::insert_into(compliance_doc_request::table)
            .values(self)
            .get_result(conn.conn())?)
    }
}

impl ComplianceDocRequest {
    #[tracing::instrument("ComplianceDocRequest::get_active", skip_all)]
    pub fn get_active(
        conn: &mut TxnPgConn,
        doc: &Locked<ComplianceDoc>,
    ) -> DbResult<Option<ComplianceDocRequest>> {
        let req = compliance_doc_request::table
            .filter(compliance_doc_request::compliance_doc_id.eq(&doc.id))
            .filter(compliance_doc_request::deactivated_at.is_null())
            .select(ComplianceDocRequest::as_select())
            .first(conn.conn())
            .optional()?;

        Ok(req)
    }

    // Deactivate the request. Passing a tenant_user_id indicates it was a manual deactivation
    // rather than an implicit deactivation from a re-request.
    #[tracing::instrument("ComplianceDocRequest::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        req_id: &ComplianceDocRequestId,
        deactivated_by: Option<&TenantUserId>,
        _lock: &Locked<ComplianceDoc>,
    ) -> DbResult<()> {
        diesel::update(compliance_doc_request::table)
            .filter(compliance_doc_request::id.eq(req_id))
            .filter(compliance_doc_request::deactivated_at.is_null())
            .set((
                compliance_doc_request::deactivated_at.eq(Some(Utc::now())),
                compliance_doc_request::deactivated_by_partner_tenant_user_id.eq(deactivated_by),
            ))
            .execute(conn.conn())?;

        Ok(())
    }
}

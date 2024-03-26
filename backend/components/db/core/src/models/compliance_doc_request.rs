use crate::{DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{compliance_doc, compliance_doc_request};
use diesel::prelude::*;
use newtypes::{
    ComplianceDocId, ComplianceDocRequestId, Locked, TenantCompliancePartnershipId, TenantUserId,
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

    pub requested_by_partner_tenant_user_id: TenantUserId,
    pub assigned_to_tenant_user_id: Option<TenantUserId>,

    pub compliance_doc_id: ComplianceDocId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_request)]
pub struct NewComplianceDocRequest<'a> {
    pub created_at: DateTime<Utc>,

    pub name: &'a str,
    pub description: &'a str,

    pub requested_by_partner_tenant_user_id: &'a TenantUserId,
    pub assigned_to_tenant_user_id: Option<&'a TenantUserId>,

    pub compliance_doc_id: &'a ComplianceDocId,
}

impl<'a> NewComplianceDocRequest<'a> {
    #[tracing::instrument("NewComplianceDocRequest::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<ComplianceDocRequest> {
        Ok(diesel::insert_into(compliance_doc_request::table)
            .values(self)
            .get_result(conn)?)
    }
}

impl ComplianceDocRequest {
    pub fn lock_active(
        conn: &mut TxnPgConn,
        id: &ComplianceDocRequestId,
        partnership_id: &TenantCompliancePartnershipId,
    ) -> DbResult<Locked<ComplianceDocRequest>> {
        // Diesel doesn't support the `FOR UPDATE ON <table>` syntax for obtaining a lock on a
        // single table out of a join, so we have to make two queries.
        //
        // Check that the request is associated with the given partnership ID.
        let req = compliance_doc::table
            .inner_join(compliance_doc_request::table)
            .filter(compliance_doc::tenant_compliance_partnership_id.eq(partnership_id))
            .filter(compliance_doc_request::id.eq(id))
            .select(ComplianceDocRequest::as_select())
            .first(conn.conn())?;

        // Check that the request is active and obtain a lock on the row.
        let req = compliance_doc_request::table
            .filter(compliance_doc_request::id.eq(req.id))
            .filter(compliance_doc_request::deactivated_at.is_null())
            .for_no_key_update()
            .select(ComplianceDocRequest::as_select())
            .first(conn.conn())?;

        Ok(Locked::new(req))
    }

    pub fn deactivate(conn: &mut TxnPgConn, req: Locked<ComplianceDocRequest>) -> DbResult<()> {
        diesel::update(compliance_doc_request::table)
            .filter(compliance_doc_request::id.eq(&req.id))
            .filter(compliance_doc_request::deactivated_at.is_null())
            .set(compliance_doc_request::deactivated_at.eq(Some(Utc::now())))
            .execute(conn.conn())?;

        Ok(())
    }
}

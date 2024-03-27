use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{compliance_doc, compliance_doc_request};
use diesel::prelude::*;
use newtypes::{
    ComplianceDocId, ComplianceDocRequestId, ComplianceDocTemplateId, Locked, TenantCompliancePartnershipId,
};

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
}

impl ComplianceDoc {
    pub fn lock<'a>(
        conn: &mut TxnPgConn,
        id: impl Into<ComplianceDocIdentifier<'a>>,
        partnership_id: &TenantCompliancePartnershipId,
    ) -> DbResult<Locked<ComplianceDoc>> {
        let id: ComplianceDocIdentifier<'a> = id.into();

        let doc_id: ComplianceDocId = match id {
            ComplianceDocIdentifier::ComplianceDocId(id) => id.clone(),
            ComplianceDocIdentifier::ComplianceDocRequestId(request_id) => compliance_doc_request::table
                .filter(compliance_doc_request::id.eq(request_id))
                .select(compliance_doc_request::compliance_doc_id)
                .first(conn.conn())?,
        };

        let doc = compliance_doc::table
            .filter(compliance_doc::id.eq(doc_id))
            .filter(compliance_doc::tenant_compliance_partnership_id.eq(partnership_id))
            .for_no_key_update()
            .select(ComplianceDoc::as_select())
            .first(conn.conn())?;

        Ok(Locked::new(doc))
    }
}

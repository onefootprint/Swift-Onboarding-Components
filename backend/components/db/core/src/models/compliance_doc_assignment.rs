use crate::{DbError, DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::compliance_doc_assignment;
use diesel::prelude::*;
use newtypes::{ComplianceDocAssignmentId, ComplianceDocId, Locked, TenantKind, TenantUserId};

use super::compliance_doc::ComplianceDoc;

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc_assignment)]
pub struct ComplianceDocAssignment {
    pub id: ComplianceDocAssignmentId,

    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,

    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub compliance_doc_id: ComplianceDocId,
    pub kind: TenantKind,

    // Optional to allow for unassignment.
    pub assigned_to_tenant_user_id: Option<TenantUserId>,
    pub assigned_by_tenant_user_id: TenantUserId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_assignment)]
pub struct NewComplianceDocAssignment<'a> {
    pub created_at: DateTime<Utc>,

    pub compliance_doc_id: &'a ComplianceDocId,
    pub kind: TenantKind,

    pub assigned_to_tenant_user_id: Option<&'a TenantUserId>,
    pub assigned_by_tenant_user_id: &'a TenantUserId,
}

impl<'a> NewComplianceDocAssignment<'a> {
    #[tracing::instrument("NewComplianceDocAssignment::create", skip_all)]
    pub fn create(
        self,
        conn: &mut TxnPgConn,
        doc: &Locked<ComplianceDoc>,
    ) -> DbResult<ComplianceDocAssignment> {
        if doc.id != *self.compliance_doc_id {
            return Err(DbError::AssertionError(
                "locked document does not match new assignment".to_string(),
            ));
        }

        // Deactivate existing assignment if one exists.
        if let Some(prev_assignment) = ComplianceDocAssignment::get_active(conn, self.kind, doc)? {
            ComplianceDocAssignment::deactivate(conn, &prev_assignment.id, doc)?;
        }

        Ok(diesel::insert_into(compliance_doc_assignment::table)
            .values(self)
            .get_result(conn.conn())?)
    }
}

impl ComplianceDocAssignment {
    #[tracing::instrument("ComplianceDocAssignment::get_active", skip_all)]
    pub fn get_active(
        conn: &mut TxnPgConn,
        kind: TenantKind,
        doc: &Locked<ComplianceDoc>,
    ) -> DbResult<Option<ComplianceDocAssignment>> {
        let req = compliance_doc_assignment::table
            .filter(compliance_doc_assignment::compliance_doc_id.eq(&doc.id))
            .filter(compliance_doc_assignment::kind.eq(kind))
            .filter(compliance_doc_assignment::deactivated_at.is_null())
            .select(ComplianceDocAssignment::as_select())
            .first(conn.conn())
            .optional()?;

        Ok(req)
    }

    #[tracing::instrument("ComplianceDocAssignment::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        id: &ComplianceDocAssignmentId,
        doc: &Locked<ComplianceDoc>,
    ) -> DbResult<()> {
        diesel::update(compliance_doc_assignment::table)
            .filter(compliance_doc_assignment::id.eq(id))
            .filter(compliance_doc_assignment::compliance_doc_id.eq(&doc.id))
            .filter(compliance_doc_assignment::deactivated_at.is_null())
            .set(compliance_doc_assignment::deactivated_at.eq(Some(Utc::now())))
            .execute(conn.conn())?;

        Ok(())
    }
}

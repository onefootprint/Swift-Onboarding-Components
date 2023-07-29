use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::document_request;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::ModernIdDocKind;
use newtypes::WorkflowId;
use newtypes::{DocumentRequestId, ScopedVaultId};

pub type DocRefId = String;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = document_request)]
pub struct DocumentRequest {
    pub id: DocumentRequestId,
    // Not really needed anymore since we can go through Workflow
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<DocRefId>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub should_collect_selfie: bool,
    pub workflow_id: WorkflowId,
    pub only_us: bool,
    pub doc_type_restriction: Option<Vec<ModernIdDocKind>>,
}

impl DocumentRequest {
    #[tracing::instrument("DocumentRequest::create", skip_all)]
    pub fn create(conn: &mut PgConn, args: NewDocumentRequestArgs) -> DbResult<Self> {
        let NewDocumentRequestArgs {
            scoped_vault_id,
            ref_id,
            workflow_id,
            should_collect_selfie,
            only_us,
            doc_type_restriction,
        } = args;
        let new = NewDocumentRequestRow {
            scoped_vault_id,
            ref_id,
            created_at: Utc::now(),
            should_collect_selfie,
            workflow_id,
            only_us,
            doc_type_restriction,
        };
        let result = diesel::insert_into(document_request::table)
            .values(new)
            .get_result::<DocumentRequest>(conn)?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::get", skip_all)]
    pub fn get(conn: &mut PgConn, wf_id: &WorkflowId) -> DbResult<Option<Self>> {
        let result = document_request::table
            .filter(document_request::workflow_id.eq(wf_id))
            .first(conn)
            .optional()?;
        Ok(result)
    }
}

#[derive(Debug, Clone)]
pub struct NewDocumentRequestArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<String>,
    pub should_collect_selfie: bool,
    pub workflow_id: WorkflowId,
    pub only_us: bool,
    pub doc_type_restriction: Option<Vec<ModernIdDocKind>>,
}

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = document_request)]
struct NewDocumentRequestRow {
    scoped_vault_id: ScopedVaultId,
    ref_id: Option<String>,
    created_at: DateTime<Utc>,
    should_collect_selfie: bool,
    workflow_id: WorkflowId,
    only_us: bool,
    doc_type_restriction: Option<Vec<ModernIdDocKind>>,
}

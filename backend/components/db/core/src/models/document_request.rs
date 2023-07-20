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
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<DocRefId>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub should_collect_selfie: bool,
    pub workflow_id: Option<WorkflowId>,
    pub only_us: bool,
    pub doc_type_restriction: Option<Vec<ModernIdDocKind>>,
}

// A document request is uniquely identified by this weird combination while we are in progress
// migrating to Workflows.
// TODO use the workflow ID
pub struct DocRequestIdentifier<'a> {
    pub sv_id: &'a ScopedVaultId,
    pub wf_id: Option<&'a WorkflowId>,
}

impl<'a> DocRequestIdentifier<'a> {
    pub fn new(sv_id: &'a ScopedVaultId, wf_id: Option<&'a WorkflowId>) -> Self {
        Self { sv_id, wf_id }
    }
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
    pub fn get(conn: &mut PgConn, id: DocRequestIdentifier) -> DbResult<Option<Self>> {
        let mut query = document_request::table.into_boxed();

        // TODO we should backfill workflow_id on DocumentRequest and deprecate this old codepath
        if let Some(wf_id) = id.wf_id {
            query = query.filter(document_request::workflow_id.eq(wf_id))
        } else {
            // For legacy codepaths with no workflow, we want to make sure we don't find doc
            // requests belonging to a re-collect document workflow
            query = query
                .filter(document_request::scoped_vault_id.eq(id.sv_id))
                .filter(document_request::workflow_id.is_null())
        }
        let result = query.first(conn).optional()?;
        Ok(result)
    }
}

#[derive(Debug, Clone)]
pub struct NewDocumentRequestArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<String>,
    pub should_collect_selfie: bool,
    pub workflow_id: Option<WorkflowId>,
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
    workflow_id: Option<WorkflowId>,
    only_us: bool,
    doc_type_restriction: Option<Vec<ModernIdDocKind>>,
}

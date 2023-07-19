use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::document_request::BoxedQuery;
use db_schema::schema::{document_request, identity_document};
use diesel::dsl::not;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::ModernIdDocKind;
use newtypes::WorkflowId;
use newtypes::{DocumentRequestId, DocumentRequestStatus, Locked, ScopedVaultId};

use super::identity_document::IdentityDocument;

pub type DocRefId = String;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = document_request)]
pub struct DocumentRequest {
    pub id: DocumentRequestId,
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<DocRefId>,
    pub status: DocumentRequestStatus,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub should_collect_selfie: bool,
    pub workflow_id: Option<WorkflowId>,
    pub only_us: bool,
    pub doc_type_restriction: Option<Vec<ModernIdDocKind>>,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = document_request)]
pub struct DocumentRequestUpdate {
    pub status: Option<DocumentRequestStatus>,
}

impl DocumentRequestUpdate {
    pub fn status(status: DocumentRequestStatus) -> Self {
        Self { status: Some(status) }
    }
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
            status: DocumentRequestStatus::Pending,
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

    #[tracing::instrument("DocumentRequest::lock_active", skip_all)]
    pub fn lock_active(conn: &mut TxnPgConn, id: DocRequestIdentifier) -> DbResult<Locked<Self>> {
        let doc = Self::get_active(conn, id)?.ok_or(crate::DbError::ObjectNotFound)?;
        // Can't use into_boxed with locks
        let result = document_request::table
            .filter(document_request::id.eq(&doc.id))
            .for_no_key_update()
            .first::<Self>(conn.conn())?;

        Ok(Locked::new(result))
    }

    fn get_query(id: DocRequestIdentifier) -> BoxedQuery<Pg> {
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
        query
    }

    #[tracing::instrument("DocumentRequest::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, id: DocRequestIdentifier) -> DbResult<Option<Self>> {
        let result = Self::get_query(id)
            .filter(document_request::status.eq(DocumentRequestStatus::Pending))
            .first(conn)
            .optional()?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: DocRequestIdentifier) -> DbResult<Option<Self>> {
        let result = Self::get_query(id).first(conn).optional()?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::update", skip_all)]
    pub fn update(self, conn: &mut PgConn, update: DocumentRequestUpdate) -> DbResult<Self> {
        // Intentionally consume self so the stale version is not used
        let result = diesel::update(document_request::table)
            .filter(document_request::id.eq(&self.id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::lock", skip_all)]
    pub fn lock(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
        id: &DocumentRequestId,
    ) -> DbResult<Locked<Self>> {
        let result = document_request::table
            .filter(document_request::id.eq(id))
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("DocumentRequest::get_latest_complete", skip_all)]
    pub fn get_latest_complete(
        conn: &mut PgConn,
        sv_id: ScopedVaultId,
    ) -> DbResult<Option<(DocumentRequest, IdentityDocument)>> {
        let res = document_request::table
            .inner_join(identity_document::table)
            // TODO should this be only Complete?
            .filter(not(document_request::status.eq(DocumentRequestStatus::Pending)))
            .filter(document_request::scoped_vault_id.eq(sv_id))
            .first(conn)
            .optional()?;

        Ok(res)
    }
}

impl DocumentRequest {
    pub fn is_pending(&self) -> bool {
        self.status == DocumentRequestStatus::Pending
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
    status: DocumentRequestStatus,
    created_at: DateTime<Utc>,
    should_collect_selfie: bool,
    workflow_id: Option<WorkflowId>,
    only_us: bool,
    doc_type_restriction: Option<Vec<ModernIdDocKind>>,
}

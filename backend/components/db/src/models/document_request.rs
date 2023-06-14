use crate::PgConn;
use crate::TxnPgConn;
use crate::{schema::document_request, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::ModernIdDocKind;
use newtypes::WorkflowId;
use newtypes::{DocumentRequestId, DocumentRequestStatus, Locked, ScopedVaultId};

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

impl DocumentRequest {
    #[tracing::instrument(skip_all)]
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

    #[tracing::instrument(skip_all)]
    pub fn lock_active(conn: &mut TxnPgConn, id: DocRequestIdentifier) -> DbResult<Locked<Self>> {
        let doc = Self::get_active(conn, id)?.ok_or(crate::DbError::ObjectNotFound)?;
        // Can't use into_boxed with locks
        let result = document_request::table
            .filter(document_request::id.eq(&doc.id))
            .for_no_key_update()
            .first::<Self>(conn.conn())?;

        Ok(Locked::new(result))
    }

    #[tracing::instrument(skip_all)]
    pub fn get_active(conn: &mut PgConn, id: DocRequestIdentifier) -> DbResult<Option<Self>> {
        let mut query = document_request::table
            .filter(document_request::status.eq(DocumentRequestStatus::Pending))
            .into_boxed();

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

    #[tracing::instrument(skip_all)]
    pub fn get(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Option<Self>> {
        let result = document_request::table
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .first(conn)
            .optional()?;

        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn update(self, conn: &mut PgConn, update: DocumentRequestUpdate) -> DbResult<Self> {
        // Intentionally consume self so the stale version is not used
        let result = Self::update_by_id(conn, &self.id, update)?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn update_by_id(
        conn: &mut PgConn,
        id: &DocumentRequestId,
        update: DocumentRequestUpdate,
    ) -> DbResult<Self> {
        let result = diesel::update(document_request::table)
            .filter(document_request::id.eq(id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn count_statuses(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        statuses: Vec<DocumentRequestStatus>,
    ) -> DbResult<i64> {
        let num_status: i64 = document_request::table
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .filter(document_request::status.eq_any(statuses))
            .count()
            .get_result(conn)?;
        Ok(num_status)
    }

    #[tracing::instrument(skip_all)]
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

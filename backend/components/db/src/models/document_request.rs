use crate::PgConn;
use crate::TxnPgConn;
use crate::{schema::document_request, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{DocumentRequestId, DocumentRequestStatus, Locked, ScopedVaultId};
use serde::{Deserialize, Serialize};

pub type DocRefId = String;
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
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

impl DocumentRequest {
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut PgConn,
        scoped_vault_id: ScopedVaultId,
        ref_id: Option<String>,
        should_collect_selfie: bool,
    ) -> DbResult<Self> {
        let new = NewDocumentRequest {
            scoped_vault_id,
            ref_id,
            status: DocumentRequestStatus::Pending,
            created_at: Utc::now(),
            should_collect_selfie,
        };
        let result = diesel::insert_into(document_request::table)
            .values(new)
            .get_result::<DocumentRequest>(conn)?;
        Ok(result)
    }

    /// Note: we only allow a single pending DocumentRequest per scoped user id (there's a unique index)
    #[tracing::instrument(skip_all)]
    pub fn lock_active(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Locked<Self>> {
        let result = document_request::table
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .filter(document_request::status.eq(DocumentRequestStatus::Pending))
            .for_no_key_update()
            .first::<Self>(conn)?;

        Ok(Locked::new(result))
    }

    /// Note: we only allow a single pending DocumentRequest per scoped user id (there's a unique index)
    #[tracing::instrument(skip_all)]
    pub fn get_active(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Option<Self>> {
        let result = document_request::table
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .filter(document_request::status.eq(DocumentRequestStatus::Pending))
            .first(conn)
            .optional()?;

        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn get(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Self> {
        let result = document_request::table
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .first(conn)?;

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

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = document_request)]
pub struct NewDocumentRequest {
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<String>,
    pub status: DocumentRequestStatus,
    pub created_at: DateTime<Utc>,
    pub should_collect_selfie: bool,
}

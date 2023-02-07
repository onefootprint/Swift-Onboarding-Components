use crate::schema::{identity_document, verification_request, verification_result};
use crate::PgConn;
use crate::TxnPgConn;
use crate::{schema::document_request, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{DocumentRequestId, DocumentRequestStatus, IdentityDocumentId, Locked, ScopedUserId};
use serde::{Deserialize, Serialize};

use super::verification_result::VerificationResult;

pub type DocRefId = String;
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = document_request)]
pub struct DocumentRequest {
    pub id: DocumentRequestId,
    pub scoped_user_id: ScopedUserId,
    pub ref_id: Option<DocRefId>,
    pub status: DocumentRequestStatus,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub should_collect_selfie: bool,
    pub idv_reqs_initiated: bool,
    // We keep track of the previous document request in the case we want to not recollect selfie, we can copy over the s3 path
    pub previous_document_request_id: Option<DocumentRequestId>,
}
#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = document_request)]
pub struct DocumentRequestUpdate {
    pub status: Option<DocumentRequestStatus>,
    pub idv_reqs_initiated: Option<bool>,
}

impl DocumentRequestUpdate {
    pub fn status(status: DocumentRequestStatus) -> Self {
        Self {
            status: Some(status),
            ..Default::default()
        }
    }

    pub fn idv_reqs_initiated() -> Self {
        Self {
            idv_reqs_initiated: Some(true),
            ..Default::default()
        }
    }
}

impl DocumentRequest {
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut PgConn,
        scoped_user_id: ScopedUserId,
        ref_id: Option<String>,
        should_collect_selfie: bool,
        previous_document_request_id: Option<DocumentRequestId>,
    ) -> DbResult<Self> {
        let new = NewDocumentRequest {
            scoped_user_id,
            ref_id,
            status: DocumentRequestStatus::Pending,
            created_at: Utc::now(),
            idv_reqs_initiated: false,
            should_collect_selfie,
            previous_document_request_id,
        };
        let result = diesel::insert_into(document_request::table)
            .values(new)
            .get_result::<DocumentRequest>(conn)?;
        Ok(result)
    }

    /// Note: we only allow a single pending DocumentRequest per scoped user id (there's a unique index)
    #[tracing::instrument(skip_all)]
    pub fn lock_active(conn: &mut PgConn, scoped_user_id: &ScopedUserId) -> DbResult<Locked<Self>> {
        let result = document_request::table
            .filter(document_request::scoped_user_id.eq(scoped_user_id))
            .filter(document_request::status.eq(DocumentRequestStatus::Pending))
            .for_no_key_update()
            .first::<Self>(conn)?;

        Ok(Locked::new(result))
    }

    /// Note: we only allow a single pending DocumentRequest per scoped user id (there's a unique index)
    #[tracing::instrument(skip_all)]
    pub fn get_active(conn: &mut PgConn, scoped_user_id: &ScopedUserId) -> DbResult<Self> {
        let result = document_request::table
            .filter(document_request::scoped_user_id.eq(scoped_user_id))
            .filter(document_request::status.eq(DocumentRequestStatus::Pending))
            .first::<Self>(conn)?;

        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn get(
        conn: &mut PgConn,
        scoped_user_id: &ScopedUserId,
        request_id: &DocumentRequestId,
    ) -> DbResult<Self> {
        let result = document_request::table
            .filter(document_request::scoped_user_id.eq(scoped_user_id))
            .filter(document_request::id.eq(request_id))
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
    pub fn count_status(
        conn: &mut PgConn,
        scoped_user_id: &ScopedUserId,
        status: DocumentRequestStatus,
    ) -> DbResult<i64> {
        let num_status: i64 = document_request::table
            .filter(document_request::scoped_user_id.eq(scoped_user_id))
            .filter(document_request::status.eq(status))
            .count()
            .get_result(conn)?;
        Ok(num_status)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_latest_with_verification_result(
        conn: &mut PgConn,
        scoped_user_id: &ScopedUserId,
    ) -> DbResult<(DocumentRequest, Option<VerificationResult>)> {
        let latest_doc_request: Self = document_request::table
            .filter(document_request::scoped_user_id.eq(scoped_user_id))
            .order_by(document_request::created_at.desc())
            .first(conn)?;

        if let Some(previous_doc_request_id) = latest_doc_request.previous_document_request_id.clone() {
            let previous_identity_doc: Option<IdentityDocumentId> = document_request::table
                .filter(document_request::id.eq(previous_doc_request_id))
                .filter(document_request::scoped_user_id.eq(scoped_user_id))
                .inner_join(identity_document::table)
                .select(identity_document::id)
                .first::<IdentityDocumentId>(conn)
                .ok();

            // TODO: this breaks when we have more than 1 verification result corresponding to a single identity document
            let previous_verif_result: Option<VerificationResult> = verification_request::table
            .filter(verification_request::identity_document_id.eq(previous_identity_doc))
            .inner_join(verification_result::table)
            .select(verification_result::all_columns)
            .first::<VerificationResult>(conn) // <-- this needs to go away with multiple vendors, and we should return a vec of results
            .ok();

            Ok((latest_doc_request, previous_verif_result))
        } else {
            Ok((latest_doc_request, None))
        }
    }

    #[tracing::instrument(skip_all)]
    pub fn lock(
        conn: &mut TxnPgConn,
        scoped_user_id: &ScopedUserId,
        id: &DocumentRequestId,
    ) -> DbResult<Locked<Self>> {
        let result = document_request::table
            .filter(document_request::id.eq(id))
            .filter(document_request::scoped_user_id.eq(scoped_user_id))
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
    pub scoped_user_id: ScopedUserId,
    pub ref_id: Option<String>,
    pub status: DocumentRequestStatus,
    pub created_at: DateTime<Utc>,
    pub should_collect_selfie: bool,
    pub idv_reqs_initiated: bool,
    pub previous_document_request_id: Option<DocumentRequestId>,
}

use crate::schema::{identity_document, verification_request, verification_result};
use crate::TxnPgConnection;
use crate::{schema::document_request, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
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
    pub idv_reqs_initiated: bool,
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
            status: Some(DocumentRequestStatus::Uploaded),
        }
    }
}

impl DocumentRequest {
    pub fn create(
        conn: &mut PgConnection,
        scoped_user_id: ScopedUserId,
        ref_id: Option<String>,
    ) -> DbResult<Self> {
        let new = NewDocumentRequest {
            scoped_user_id,
            ref_id,
            status: DocumentRequestStatus::Pending,
            created_at: Utc::now(),
            idv_reqs_initiated: false,
        };
        let result = diesel::insert_into(document_request::table)
            .values(new)
            .get_result::<DocumentRequest>(conn)?;
        Ok(result)
    }

    pub fn get_active_requests(
        conn: &mut PgConnection,
        scoped_user_id: &ScopedUserId,
    ) -> DbResult<Vec<Self>> {
        let results = document_request::table
            .filter(document_request::scoped_user_id.eq(scoped_user_id))
            .filter(document_request::status.eq(DocumentRequestStatus::Pending))
            .load::<Self>(conn)?;

        Ok(results)
    }

    pub fn get(
        conn: &mut PgConnection,
        scoped_user_id: &ScopedUserId,
        request_id: &DocumentRequestId,
    ) -> DbResult<Self> {
        let result = document_request::table
            .filter(document_request::scoped_user_id.eq(scoped_user_id))
            .filter(document_request::id.eq(request_id))
            .first(conn)?;

        Ok(result)
    }

    pub fn update(self, conn: &mut PgConnection, update: DocumentRequestUpdate) -> DbResult<Self> {
        // Intentionally consume self so the stale version is not used
        let result = Self::update_by_id(conn, &self.id, update)?;
        Ok(result)
    }

    pub fn update_by_id(
        conn: &mut PgConnection,
        id: &DocumentRequestId,
        update: DocumentRequestUpdate,
    ) -> DbResult<Self> {
        let result = diesel::update(document_request::table)
            .filter(document_request::id.eq(id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }

    pub fn get_with_verification_result(
        conn: &mut PgConnection,
        scoped_user_id: &ScopedUserId,
        id: &DocumentRequestId,
    ) -> DbResult<(DocumentRequest, Option<VerificationResult>)> {
        let (doc_request, identity_doc): (Self, IdentityDocumentId) = document_request::table
            .filter(document_request::id.eq(id))
            .filter(document_request::scoped_user_id.eq(scoped_user_id))
            .inner_join(identity_document::table)
            .select((document_request::all_columns, identity_document::id))
            .get_result(conn)?;

        let verif_result: Option<VerificationResult> = verification_request::table
            .filter(verification_request::identity_document_id.eq(Some(identity_doc)))
            .inner_join(verification_result::table)
            .select(verification_result::all_columns)
            .get_result::<VerificationResult>(conn)
            .ok();

        Ok((doc_request, verif_result))
    }

    pub fn lock(
        conn: &mut TxnPgConnection,
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
    pub idv_reqs_initiated: bool,
}

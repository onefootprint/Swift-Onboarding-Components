use crate::PgConn;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{document_request, document_upload, identity_document};

use crypto::aead::{AeadSealedBytes, ScopedSealingKey};
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use std::collections::HashMap;

use newtypes::{
    Base64Data, DataLifetimeId, DataLifetimeSeqno, DocumentRequestId, DocumentSide, IdDocKind,
    IdentityDocumentId, IdentityDocumentStatus, ScopedVaultId, VaultId,
};

use super::document_request::DocumentRequest;
use super::document_upload::DocumentUpload;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = identity_document)]
pub struct IdentityDocument {
    pub id: IdentityDocumentId,
    pub request_id: DocumentRequestId,
    /// This is the stated document type, selected by the user, not necessarily the true document type
    pub document_type: IdDocKind,
    pub country_code: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    // TODO I don't think these lifetime_id columns are ever read - we could probably drop them in
    // favor of the completed_seqno
    pub front_lifetime_id: Option<DataLifetimeId>,
    pub back_lifetime_id: Option<DataLifetimeId>,
    pub selfie_lifetime_id: Option<DataLifetimeId>,
    pub completed_seqno: Option<DataLifetimeSeqno>,
    // DO NOT CHANGE THE ORDER OF THESE FIELDS
    pub document_score: Option<f64>,
    pub selfie_score: Option<f64>,
    pub ocr_confidence_score: Option<f64>,
    pub status: IdentityDocumentStatus, // TODO rename to IdentityDocumentStatus
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = identity_document)]
pub struct NewIdentityDocumentArgs {
    pub request_id: DocumentRequestId,
    pub document_type: IdDocKind,
    pub country_code: String,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = identity_document)]
struct NewIdentityDocumentRow {
    request_id: DocumentRequestId,
    document_type: IdDocKind,
    country_code: String,
    created_at: DateTime<Utc>,
    status: IdentityDocumentStatus,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = identity_document)]
pub struct IdentityDocumentUpdate {
    pub front_lifetime_id: Option<DataLifetimeId>,
    pub back_lifetime_id: Option<DataLifetimeId>,
    pub selfie_lifetime_id: Option<DataLifetimeId>,
    pub completed_seqno: Option<DataLifetimeSeqno>,
    pub document_score: Option<f64>,
    pub selfie_score: Option<f64>,
    pub ocr_confidence_score: Option<f64>,
    pub status: Option<IdentityDocumentStatus>,
}

impl IdentityDocument {
    #[tracing::instrument("IdentityDocument::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewIdentityDocumentArgs) -> DbResult<Self> {
        document_request::table
            .filter(document_request::id.eq(&args.request_id))
            .for_no_key_update()
            .get_result::<DocumentRequest>(conn.conn())?;
        // Mark all existing IdentityDocuments for this DocumentRequest as failed
        diesel::update(identity_document::table)
            .filter(identity_document::request_id.eq(&args.request_id))
            .filter(identity_document::status.eq(IdentityDocumentStatus::Pending))
            .set(identity_document::status.eq(IdentityDocumentStatus::Failed))
            .execute(conn.conn())?;
        // Create a new doc
        let NewIdentityDocumentArgs {
            request_id,
            document_type,
            country_code,
        } = args;
        let new = NewIdentityDocumentRow {
            request_id,
            document_type,
            country_code,
            created_at: Utc::now(),
            status: IdentityDocumentStatus::Pending,
        };
        let result = diesel::insert_into(identity_document::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }

    // TODO deprecate this
    #[tracing::instrument("IdentityDocument::get_or_create", skip_all)]
    pub fn get_or_create(conn: &mut TxnPgConn, args: NewIdentityDocumentArgs) -> DbResult<Self> {
        let existing_doc = identity_document::table
            .filter(identity_document::request_id.eq(&args.request_id))
            .get_result(conn.conn())
            .optional()?;
        let result = if let Some(existing_doc) = existing_doc {
            existing_doc
        } else {
            // Create a new doc
            let NewIdentityDocumentArgs {
                request_id,
                document_type,
                country_code,
            } = args;
            let new = NewIdentityDocumentRow {
                request_id,
                document_type,
                country_code,
                created_at: Utc::now(),
                status: IdentityDocumentStatus::Pending,
            };
            diesel::insert_into(identity_document::table)
                .values(new)
                .get_result(conn.conn())?
        };
        Ok(result)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument("IdentityDocument::update", skip_all)]
    pub fn update(
        conn: &mut PgConn,
        id: &IdentityDocumentId,
        update: IdentityDocumentUpdate,
    ) -> DbResult<Self> {
        let res = diesel::update(identity_document::table)
            .filter(identity_document::id.eq(id))
            .set(update)
            .get_result(conn)?;

        Ok(res)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument("IdentityDocument::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &IdentityDocumentId) -> DbResult<(Self, DocumentRequest)> {
        let res = identity_document::table
            .filter(identity_document::id.eq(id))
            .inner_join(document_request::table)
            .select((identity_document::all_columns, document_request::all_columns))
            .get_result(conn)?;

        Ok(res)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument("IdentityDocument::get_by_request_id", skip_all)]
    pub fn get_by_request_id(conn: &mut PgConn, request_id: &DocumentRequestId) -> DbResult<Option<Self>> {
        let res = identity_document::table
            .filter(identity_document::request_id.eq(request_id))
            .get_result(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument("IdentityDocument::get_bulk_with_requests", skip_all)]
    pub fn get_bulk_with_requests(
        conn: &mut PgConn,
        ids: Vec<&IdentityDocumentId>,
    ) -> DbResult<HashMap<IdentityDocumentId, (Self, DocumentRequest)>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(identity_document::id.eq_any(ids))
            .get_results::<(Self, DocumentRequest)>(conn)?
            .into_iter()
            .map(|e| (e.0.id.clone(), e))
            .collect();

        Ok(results)
    }

    /// Get all the documents collected for a given scoped vault over all workflows
    #[tracing::instrument("IdentityDocument::list", skip_all)]
    pub fn list(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Vec<Self>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .select(identity_document::all_columns)
            .get_results(conn)?;

        Ok(results)
    }

    #[tracing::instrument("IdentityDocument::get_latest_complete", skip_all)]
    pub fn get_latest_complete(
        conn: &mut PgConn,
        sv_id: ScopedVaultId,
    ) -> DbResult<Option<(IdentityDocument, DocumentRequest)>> {
        let res = identity_document::table
            .inner_join(document_request::table)
            // TODO should this be only Complete?
            .filter(not(identity_document::status.eq(IdentityDocumentStatus::Pending)))
            .filter(document_request::scoped_vault_id.eq(sv_id))
            .first(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument("IdentityDocument::images", skip_all)]
    pub fn images(&self, conn: &mut PgConn, only_active: bool) -> DbResult<Vec<DocumentUpload>> {
        let mut query = document_upload::table
            .filter(document_upload::document_id.eq(&self.id))
            .into_boxed();
        if only_active {
            query = query.filter(document_upload::deactivated_at.is_null())
        }
        let results = query.get_results(conn)?;
        Ok(results)
    }
}

impl IdentityDocument {
    pub fn seal_with_data_key(
        b64_image: &str,
        data_key: &ScopedSealingKey,
    ) -> Result<AeadSealedBytes, crypto::Error> {
        let b64_data = Base64Data::from_str_standard(b64_image)?;
        data_key.seal_bytes(&b64_data.0)
    }

    pub fn unseal_with_data_key(
        image_bytes: AeadSealedBytes,
        data_key: &ScopedSealingKey,
    ) -> Result<String, crypto::Error> {
        let bytes = data_key.unseal_bytes(image_bytes)?;
        Ok(Base64Data::into_string_standard(bytes).0)
    }

    pub fn s3_path_for_document_image(
        side: DocumentSide,
        document_request_id: &DocumentRequestId,
        user_vault_id: &VaultId,
    ) -> String {
        // Store documents in a path like "documents/encrypted/uv_1234/front/dr_1234"
        format!(
            "documents/encrypted/{}/{}/{}",
            user_vault_id, side, document_request_id
        )
    }
}

use crate::PgConn;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{document_request, document_upload, identity_document};

use crypto::aead::{AeadSealedBytes, ScopedSealingKey};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use std::collections::HashMap;

use newtypes::{
    Base64Data, DataLifetimeId, DocumentRequestId, DocumentSide, IdDocKind, IdentityDocumentId,
    ScopedVaultId, VaultId,
};

pub type S3Url = String;

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
    pub front_lifetime_id: Option<DataLifetimeId>,
    pub back_lifetime_id: Option<DataLifetimeId>,
    pub selfie_lifetime_id: Option<DataLifetimeId>,
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
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = identity_document)]
pub struct IdentityDocumentUpdate {
    pub front_lifetime_id: Option<DataLifetimeId>,
    pub back_lifetime_id: Option<DataLifetimeId>,
    pub selfie_lifetime_id: Option<DataLifetimeId>,
}

impl IdentityDocument {
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

    /// Get all the documents collected for a given onboarding
    #[tracing::instrument("IdentityDocument::list", skip_all)]
    pub fn list(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Vec<Self>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .select(identity_document::all_columns)
            .get_results(conn)?;

        Ok(results)
    }

    #[tracing::instrument("IdentityDocument::images", skip_all)]
    pub fn images(&self, conn: &mut PgConn) -> DbResult<Vec<DocumentUpload>> {
        let results = document_upload::table
            .filter(document_upload::document_id.eq(&self.id))
            .filter(document_upload::deactivated_at.is_null())
            .get_results(conn)?;
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

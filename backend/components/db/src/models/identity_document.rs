use crate::schema::{data_lifetime, document_request, identity_document};
use crate::PgConn;
use crate::{DbResult, HasLifetime, TxnPgConn};
use chrono::{DateTime, Utc};
use crypto::aead::{AeadSealedBytes, ScopedSealingKey};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use std::collections::HashMap;

use newtypes::{
    Base64Data, DataLifetimeId, DataLifetimeKind, DocumentRequestId, IdDocKind, IdentityDocumentId,
    ScopedVaultId, SealedVaultDataKey, VaultId,
};
use serde::{Deserialize, Serialize};

use super::data_lifetime::DataLifetime;
use super::document_request::DocumentRequest;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = identity_document)]
pub struct IdentityDocument {
    pub id: IdentityDocumentId,
    pub request_id: DocumentRequestId,
    pub front_image_s3_url: Option<String>,
    pub back_image_s3_url: Option<String>,
    pub document_type: IdDocKind,
    pub country_code: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub e_data_key: SealedVaultDataKey,
    pub lifetime_id: DataLifetimeId,
    pub selfie_image_s3_url: Option<String>,
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
        image_type: &str,
        document_request_id: DocumentRequestId,
        user_vault_id: VaultId,
    ) -> String {
        // Store documents in a path like "documents/encrypted/uv_1234/front/dr_1234"
        format!(
            "documents/encrypted/{}/{}/{}",
            user_vault_id, image_type, document_request_id
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = identity_document)]
pub struct NewIdentityDocument {
    pub request_id: DocumentRequestId,
    pub front_image_s3_url: Option<String>,
    pub back_image_s3_url: Option<String>,
    pub selfie_image_s3_url: Option<String>,
    pub document_type: IdDocKind,
    pub country_code: String,
    pub created_at: DateTime<Utc>,
    pub e_data_key: SealedVaultDataKey,
    pub lifetime_id: DataLifetimeId,
}

impl IdentityDocument {
    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        request_id: DocumentRequestId,
        uv_id: &VaultId,
        front_image_s3_url: Option<String>,
        back_image_s3_url: Option<String>,
        selfie_image_s3_url: Option<String>,
        document_type: IdDocKind,
        country_code: String,
        su_id: Option<&ScopedVaultId>,
        e_data_key: SealedVaultDataKey,
    ) -> DbResult<Self> {
        let seqno = DataLifetime::get_next_seqno(conn)?;
        let lifetime =
            DataLifetime::create(conn, uv_id, su_id, DataLifetimeKind::from(document_type), seqno)?;
        let new = NewIdentityDocument {
            request_id,
            front_image_s3_url,
            back_image_s3_url,
            selfie_image_s3_url,
            document_type,
            country_code,
            created_at: Utc::now(),
            e_data_key,
            lifetime_id: lifetime.id,
        };
        let result = diesel::insert_into(identity_document::table)
            .values(new)
            .get_result::<IdentityDocument>(conn.conn())?;
        Ok(result)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument(skip_all)]
    pub fn get(conn: &mut PgConn, id: &IdentityDocumentId) -> DbResult<(Self, DocumentRequest)> {
        let res: (Self, DocumentRequest) = identity_document::table
            .filter(identity_document::id.eq(id))
            .inner_join(document_request::table)
            .select((identity_document::all_columns, document_request::all_columns))
            .get_result(conn)?;

        Ok(res)
    }

    /// Get all the documents collected for a given onboarding
    #[tracing::instrument(skip_all)]
    pub fn get_for_scoped_user_id(conn: &mut PgConn, scoped_user_id: &ScopedVaultId) -> DbResult<Vec<Self>> {
        let results = identity_document::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::scoped_user_id.eq(scoped_user_id))
            .select(identity_document::all_columns)
            .get_results(conn)?;

        Ok(results)
    }

    #[tracing::instrument(skip_all)]
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
}

pub type SaturatedIdentityDocumentTimelineEvent = (IdentityDocument, DocumentRequest);

/// The status of an identity document is often needed in conjunction with the document itself,
/// so we use IdentityDocumentAndRequest in various places (like when we build a UVWs)
#[derive(Debug, Clone, derive_more::Deref)]
pub struct IdentityDocumentAndRequest {
    #[deref]
    pub identity_document: IdentityDocument,
    pub document_request: DocumentRequest,
}

impl HasLifetime for IdentityDocumentAndRequest {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    fn get_for(conn: &mut PgConn, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = identity_document::table
            .filter(identity_document::lifetime_id.eq_any(lifetime_ids))
            .inner_join(document_request::table)
            .select((identity_document::all_columns, document_request::all_columns))
            .get_results::<(IdentityDocument, DocumentRequest)>(conn)?
            .into_iter()
            .map(|(doc, req)| IdentityDocumentAndRequest {
                identity_document: doc,
                document_request: req,
            })
            .collect();
        Ok(results)
    }
}

#[cfg(test)]
mod tests {

    use super::*;
    use crate::{test_helpers::test_db_pool, DbError};

    #[tokio::test]
    async fn test_create() -> Result<(), DbError> {
        let db_pool = test_db_pool();

        db_pool
            .db_transaction(|conn| -> Result<(), DbError> {
                let id_doc = IdentityDocument::create(
                    conn,
                    DocumentRequestId::from(String::from("dr_id")),
                    &VaultId::from(String::from("uv_id")),
                    Some("s3_123".to_string()),
                    Some("s3_345".to_string()),
                    Some("s3_678".to_string()),
                    IdDocKind::IdCard,
                    "usa".to_string(),
                    None,
                    SealedVaultDataKey::default(),
                )?;

                let (id_doc_from_db, _) = IdentityDocument::get(conn.conn(), &id_doc.id)?;
                assert_eq!(&id_doc.id, &id_doc_from_db.id);

                Ok(())
            })
            .await
            .ok();

        Ok(())
    }
}

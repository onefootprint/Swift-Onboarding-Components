use crate::schema::{data_lifetime, document_request, identity_document};
use crate::{DbResult, HasLifetime, TxnPgConnection};
use chrono::{DateTime, Utc};
use crypto::aead::{AeadSealedBytes, ScopedSealingKey};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};

use newtypes::{
    Base64Data, DataLifetimeId, DataLifetimeKind, DocumentRequestId, IdDocKind, IdentityDocumentId,
    ScopedUserId, SealedVaultDataKey, UserVaultId,
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

impl HasLifetime for IdentityDocument {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    fn get_for(conn: &mut PgConnection, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = identity_document::table
            .filter(identity_document::lifetime_id.eq_any(lifetime_ids))
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
        Ok(Base64Data::into_string_standard(bytes))
    }
    pub fn s3_path_for_document_image(
        image_type: &str,
        document_request_id: DocumentRequestId,
        user_vault_id: UserVaultId,
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
    pub fn create(
        conn: &mut TxnPgConnection,
        request_id: DocumentRequestId,
        uv_id: &UserVaultId,
        front_image_s3_url: Option<String>,
        back_image_s3_url: Option<String>,
        selfie_image_s3_url: Option<String>,
        document_type: IdDocKind,
        country_code: String,
        su_id: Option<&ScopedUserId>,
        e_data_key: SealedVaultDataKey,
    ) -> DbResult<Self> {
        let seqno = DataLifetime::get_next_seqno(conn)?;
        let lifetime = DataLifetime::create(conn, uv_id, su_id, DataLifetimeKind::IdentityDocument, seqno)?;
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
    pub fn get(conn: &mut PgConnection, id: &IdentityDocumentId) -> DbResult<(Self, DocumentRequest)> {
        let res: (Self, DocumentRequest) = identity_document::table
            .filter(identity_document::id.eq(id))
            .inner_join(document_request::table)
            .select((identity_document::all_columns, document_request::all_columns))
            .get_result(conn)?;

        Ok(res)
    }

    /// Get all the documents collected for a given onboarding
    pub fn get_for_scoped_user_id(
        conn: &mut PgConnection,
        scoped_user_id: &ScopedUserId,
    ) -> DbResult<Vec<Self>> {
        let results = identity_document::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::scoped_user_id.eq(scoped_user_id))
            .select(identity_document::all_columns)
            .get_results(conn)?;

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
                    &UserVaultId::from(String::from("uv_id")),
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

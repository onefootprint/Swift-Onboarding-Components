use std::collections::HashMap;

use crate::schema::identity_document;
use crate::DbResult;
use chrono::{DateTime, Utc};
use crypto::aead::{AeadSealedBytes, ScopedSealingKey};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use itertools::Itertools;
use newtypes::{
    Base64Data, DocumentRequestId, IdentityDocumentId, OnboardingId, SealedVaultDataKey, UserVaultId,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = identity_document)]
pub struct IdentityDocument {
    pub id: IdentityDocumentId,
    pub request_id: DocumentRequestId,
    pub user_vault_id: UserVaultId,
    pub front_image_s3_url: Option<String>,
    pub back_image_s3_url: Option<String>,
    pub document_type: String,
    pub country_code: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub onboarding_id: Option<OnboardingId>,
    pub e_data_key: SealedVaultDataKey,
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

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = identity_document)]
pub struct NewIdentityDocument {
    pub request_id: DocumentRequestId,
    pub user_vault_id: UserVaultId,
    pub front_image_s3_url: Option<String>,
    pub back_image_s3_url: Option<String>,
    pub document_type: String,
    pub country_code: String,
    pub created_at: DateTime<Utc>,
    pub onboarding_id: Option<OnboardingId>,
    pub e_data_key: SealedVaultDataKey,
}

impl IdentityDocument {
    #[allow(clippy::too_many_arguments)]
    pub fn create(
        conn: &mut PgConnection,
        request_id: DocumentRequestId,
        user_vault_id: UserVaultId,
        front_image_s3_url: Option<String>,
        back_image_s3_url: Option<String>,
        document_type: String,
        country_code: String,
        onboarding_id: Option<OnboardingId>,
        e_data_key: SealedVaultDataKey,
    ) -> DbResult<Self> {
        let new = NewIdentityDocument {
            request_id,
            user_vault_id,
            front_image_s3_url,
            back_image_s3_url,
            document_type,
            country_code,
            created_at: Utc::now(),
            onboarding_id,
            e_data_key,
        };
        let result = diesel::insert_into(identity_document::table)
            .values(new)
            .get_result::<IdentityDocument>(conn)?;
        Ok(result)
    }

    pub fn get(conn: &mut PgConnection, id: &IdentityDocumentId) -> DbResult<Self> {
        let res: Self = identity_document::table
            .filter(identity_document::id.eq(id))
            .first(conn)?;

        Ok(res)
    }
    /// Get all the documents collected for a given onboarding
    pub fn get_for_onboarding_id(
        conn: &mut PgConnection,
        onboarding_id: OnboardingId,
    ) -> DbResult<Vec<Self>> {
        let results = identity_document::table
            .filter(identity_document::onboarding_id.eq(onboarding_id))
            .get_results(conn)?;

        Ok(results)
    }

    /// Get all the documents collected for a given UserVault
    pub fn get_for_user_vault_id(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> DbResult<Vec<Self>> {
        let results = identity_document::table
            .filter(identity_document::user_vault_id.eq(user_vault_id))
            .get_results(conn)?;

        Ok(results)
    }

    /// Return a mapping from UserVaultId to Vec<IdentityDocument>
    pub fn multi_get_for_user_vault_ids(
        conn: &mut PgConnection,
        user_vault_ids: Vec<&UserVaultId>,
    ) -> DbResult<HashMap<UserVaultId, Vec<Self>>> {
        let results: Vec<IdentityDocument> = identity_document::table
            .filter(identity_document::user_vault_id.eq_any(user_vault_ids))
            .get_results(conn)?;

        // Group the IdentityDocuments by UserVaultId
        let results = results
            .into_iter()
            .map(|doc| (doc.user_vault_id.clone(), doc))
            .sorted_by_key(|(uv_id, _)| uv_id.clone())
            .into_group_map();
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
                    conn.conn(),
                    DocumentRequestId::from(String::from("dr_id")),
                    UserVaultId::from(String::from("uv_id")),
                    Some("s3_123".to_string()),
                    Some("s3_345".to_string()),
                    "doc_type".to_string(),
                    "usa".to_string(),
                    None,
                    SealedVaultDataKey::default(),
                )?;

                let id_doc_from_db = IdentityDocument::get(conn.conn(), &id_doc.id)?;
                assert_eq!(&id_doc.id, &id_doc_from_db.id);

                Ok(())
            })
            .await
            .ok();

        Ok(())
    }
}

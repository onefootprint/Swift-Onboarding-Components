use std::collections::HashMap;

use crate::schema::identity_document;
use crate::DbResult;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{
    Base64Data, DocumentRequestId, IdentityDocumentId, OnboardingId, SealedVaultBytes, UserVaultId,
    VaultPublicKey,
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
}

impl IdentityDocument {
    pub fn vault_seal_from_base64_string(
        image_str: &str,
        document_type: String,
        vault_public_key: &VaultPublicKey,
    ) -> Result<SealedVaultBytes, crypto::Error> {
        let b64_data = Base64Data::from_str_standard(image_str)?;
        let before_sealing = chrono::Utc::now().timestamp_millis();
        // Seal!
        let sealed = vault_public_key.seal_bytes(&b64_data.0)?;
        let after_sealing = chrono::Utc::now().timestamp_millis();

        tracing::info!(
            msg = "sealed identity document image",
            time_in_ms = before_sealing - after_sealing,
            document_type = document_type,
        );
        Ok(sealed)
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
        };
        let result = diesel::insert_into(identity_document::table)
            .values(new)
            .get_result::<IdentityDocument>(conn)?;
        Ok(result)
    }

    pub fn get(conn: &mut PgConnection, id: IdentityDocumentId) -> DbResult<Option<Self>> {
        let res: Option<Self> = identity_document::table
            .filter(identity_document::id.eq(id))
            .first(conn)
            .optional()?;

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
        user_vault_ids: &Vec<UserVaultId>,
    ) -> DbResult<HashMap<UserVaultId, Vec<Self>>> {
        let results: Vec<IdentityDocument> = identity_document::table
            .filter(identity_document::user_vault_id.eq_any(user_vault_ids))
            .get_results(conn)?;

        let mut identity_doc_base_map: HashMap<UserVaultId, Vec<IdentityDocument>> = user_vault_ids
            .iter()
            .map(|i| (i.clone(), vec![]))
            .collect::<HashMap<_, _>>();

        for id in results {
            identity_doc_base_map
                .entry(id.user_vault_id.clone())
                .and_modify(|e| e.push(id));
        }

        Ok(identity_doc_base_map)
    }
}

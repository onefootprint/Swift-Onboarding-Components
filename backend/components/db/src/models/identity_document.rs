use crate::schema::{document_request, identity_document};
use crate::PgConn;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};

use crypto::aead::{AeadSealedBytes, ScopedSealingKey};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use std::collections::HashMap;

use newtypes::{
    Base64Data, DataLifetimeId, DocumentRequestId, IdDocKind, IdentityDocumentId, ScopedVaultId,
    SealedVaultDataKey, VaultId,
};
use serde::{Deserialize, Serialize};

use super::document_request::DocumentRequest;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = identity_document)]
pub struct IdentityDocument {
    pub id: IdentityDocumentId,
    pub request_id: DocumentRequestId,
    pub document_type: IdDocKind,
    pub country_code: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub e_data_key: SealedVaultDataKey,
    pub front_lifetime_id: Option<DataLifetimeId>,
    pub back_lifetime_id: Option<DataLifetimeId>,
    pub selfie_lifetime_id: Option<DataLifetimeId>,
    pub front_image_s3_url: Option<String>,
    pub back_image_s3_url: Option<String>,
    pub selfie_image_s3_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = identity_document)]
pub struct NewIdentityDocumentArgs {
    pub request_id: DocumentRequestId,
    pub document_type: IdDocKind,
    pub country_code: String,
    pub e_data_key: SealedVaultDataKey,
    pub front_lifetime_id: Option<DataLifetimeId>,
    pub back_lifetime_id: Option<DataLifetimeId>,
    pub selfie_lifetime_id: Option<DataLifetimeId>,
    pub front_image_s3_url: Option<String>,
    pub back_image_s3_url: Option<String>,
    pub selfie_image_s3_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = identity_document)]
struct NewIdentityDocumentRow {
    request_id: DocumentRequestId,
    document_type: IdDocKind,
    country_code: String,
    created_at: DateTime<Utc>,
    e_data_key: SealedVaultDataKey,
    front_lifetime_id: Option<DataLifetimeId>,
    back_lifetime_id: Option<DataLifetimeId>,
    selfie_lifetime_id: Option<DataLifetimeId>,
    front_image_s3_url: Option<String>,
    back_image_s3_url: Option<String>,
    selfie_image_s3_url: Option<String>,
}

impl IdentityDocument {
    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument(skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewIdentityDocumentArgs) -> DbResult<Self> {
        let NewIdentityDocumentArgs {
            request_id,
            document_type,
            country_code,
            e_data_key,
            front_lifetime_id,
            back_lifetime_id,
            selfie_lifetime_id,
            front_image_s3_url,
            back_image_s3_url,
            selfie_image_s3_url,
        } = args;
        let new = NewIdentityDocumentRow {
            request_id,
            document_type,
            country_code,
            created_at: Utc::now(),
            e_data_key,
            front_lifetime_id,
            back_lifetime_id,
            selfie_lifetime_id,
            front_image_s3_url,
            back_image_s3_url,
            selfie_image_s3_url,
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

    /// Get all the documents collected for a given onboarding
    #[tracing::instrument(skip_all)]
    pub fn get_for_scoped_vault_id(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
    ) -> DbResult<Vec<Self>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .select(identity_document::all_columns)
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

use super::TenantVw;
use crate::enclave_client::EnclaveClient;
use crate::errors::ApiResult;
use db::DbPool;
use db::{
    models::{document_data::DocumentData, identity_document::IdentityDocument},
    HasLifetime,
};
use newtypes::PiiBytes;

pub struct DecryptedDocument {
    pub document: DocumentData,
    pub plaintext: PiiBytes,
}

#[derive(Default)]
pub struct DecryptedIdentityDocuments {
    pub front: Option<PiiBytes>,
    pub back: Option<PiiBytes>,
    pub selfie: Option<PiiBytes>,
}

impl<Type> TenantVw<Type> {
    /// decrypts identity document images
    /// this is internally used for verification requests
    pub async fn decrypt_id_doc_documents(
        &self,
        db_pool: &DbPool,
        enclave_client: &EnclaveClient,
        id_document: &IdentityDocument,
    ) -> ApiResult<DecryptedIdentityDocuments> {
        let lifetimes = vec![
            id_document.front_lifetime_id.clone(),
            id_document.back_lifetime_id.clone(),
            id_document.selfie_lifetime_id.clone(),
        ]
        .into_iter()
        .flatten()
        .collect::<Vec<_>>();

        let documents = db_pool
            .db_query(move |conn| DocumentData::get_for(conn, &lifetimes))
            .await??;

        let mut decrypted = DecryptedIdentityDocuments::default();

        for document in documents {
            let plaintext = enclave_client
                .decrypt_document(&self.vault.e_private_key, &document)
                .await?;
            if id_document.front_lifetime_id.as_ref() == Some(&document.lifetime_id) {
                decrypted.front = Some(plaintext);
            } else if id_document.back_lifetime_id.as_ref() == Some(&document.lifetime_id) {
                decrypted.back = Some(plaintext);
            } else if id_document.selfie_lifetime_id.as_ref() == Some(&document.lifetime_id) {
                decrypted.selfie = Some(plaintext);
            }
        }

        Ok(decrypted)
    }
}

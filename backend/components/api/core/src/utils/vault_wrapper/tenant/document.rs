use super::{DecryptRequest, TenantUvw};
use crate::errors::ApiResult;
use crate::State;
use crypto::aead::AeadSealedBytes;
use db::models::document_data::DocumentData;
use newtypes::{DataIdentifier, DocumentKind, PiiBytes};

pub struct DecryptedDocument {
    pub document: DocumentData,
    pub plaintext: PiiBytes,
}

impl TenantUvw {
    pub async fn decrypt_document(
        &self,
        state: &State,
        kind: DocumentKind,
        req: DecryptRequest,
    ) -> ApiResult<Option<DecryptedDocument>> {
        let di = vec![DataIdentifier::from(kind)];
        self.check_ob_config_access(&di)?;

        let doc = self.get_document(kind);
        if let Some(doc) = doc {
            let bytes = state
                .s3_client
                .get_object_from_s3_url(doc.s3_url.as_str())
                .await?;

            let key = &self
                .decrypt_data_keys(state, vec![doc.e_data_key.clone()])
                .await?[0];
            let plaintext = PiiBytes::new(key.unseal_bytes(AeadSealedBytes(bytes.to_vec()))?);

            req.create_access_event(state, self.scoped_vault_id.clone(), di)
                .await?;

            Ok(Some(DecryptedDocument {
                document: doc.clone(),
                plaintext,
            }))
        } else {
            Ok(None)
        }
    }
}

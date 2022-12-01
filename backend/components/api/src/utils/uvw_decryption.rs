use std::collections::HashMap;

use crypto::aead::{AeadSealedBytes, ScopedSealingKey};
use db::models::identity_document::IdentityDocument;
use db::HasDataAttributeFields;
use enclave_proxy::DataTransform;
use newtypes::{
    Base64Data, DataAttribute, IdentityDocumentId, PiiString, SealedVaultBytes, SealedVaultDataKey,
    ValidatedPhoneNumber,
};
use paperclip::actix::web;

use crate::{
    errors::{ApiError, ApiResult},
    State,
};

use super::user_vault_wrapper::UserVaultWrapper;

pub struct DecryptFieldsResult {
    pub decrypted_data_attributes: Vec<DataAttribute>,
    pub result_map: HashMap<DataAttribute, Option<PiiString>>,
}

pub struct DecryptDocumentResult {
    pub identity_document_id: IdentityDocumentId,
    pub front: PiiString,
    pub back: Option<PiiString>,
}

/// UVW impls related to decrypting data in the UserVault
impl UserVaultWrapper {
    pub async fn decrypt(
        &self,
        state: &State,
        data: Vec<&SealedVaultBytes>,
    ) -> Result<Vec<PiiString>, ApiError> {
        let decrypted_results = state
            .enclave_client
            .decrypt_bytes_batch(data, &self.user_vault.e_private_key, DataTransform::Identity)
            .await?;
        Ok(decrypted_results)
    }

    pub async fn decrypt_data_keys(
        &self,
        state: &State,
        keys: Vec<SealedVaultDataKey>,
        scope: &'static str,
    ) -> ApiResult<Vec<ScopedSealingKey>> {
        let decrypted_results = state
            .enclave_client
            .decrypt_sealed_vault_data_key(&keys, &self.user_vault.e_private_key, scope)
            .await?;

        Ok(decrypted_results)
    }

    pub async fn get_decrypted_primary_phone(&self, state: &State) -> Result<ValidatedPhoneNumber, ApiError> {
        let number = self
            .phone_number
            .as_ref()
            .ok_or(ApiError::NoPhoneNumberForVault)?;

        let decrypt_response = self
            .decrypt(state, vec![&number.e_e164, &number.e_country])
            .await?;
        let e164 = decrypt_response.get(0).ok_or(ApiError::NotImplemented)?.clone();
        let country = decrypt_response.get(1).ok_or(ApiError::NotImplemented)?.clone();

        let validated_phone_number = ValidatedPhoneNumber::__build_from_vault(e164, country)?;
        Ok(validated_phone_number)
    }

    pub async fn decrypt_data_attributes(
        &self,
        state: &web::Data<State>,
        data_attributes: Vec<DataAttribute>,
    ) -> Result<DecryptFieldsResult, ApiError> {
        // Filter out fields that don't have values set on the user vault
        let (fields_to_decrypt, e_datas): (Vec<DataAttribute>, Vec<&SealedVaultBytes>) = data_attributes
            .iter()
            .filter_map(|kind| self.get_e_field(*kind).map(|data| (kind, data)))
            .unzip();

        // Actually decrypt the fields
        let decrypt_response = self.decrypt(state, e_datas).await?;
        let decrypted_data: HashMap<DataAttribute, PiiString> = decrypt_response
            .into_iter()
            .enumerate()
            .map(|(i, result)| (fields_to_decrypt[i], result))
            .collect();
        let result_map: HashMap<DataAttribute, Option<PiiString>> = data_attributes
            .into_iter()
            .enumerate()
            .map(|(_, data_attribute)| (data_attribute, decrypted_data.get(&data_attribute).cloned()))
            .collect();
        let decrypted_data_attributes = result_map.iter().map(|(kind, _)| *kind).collect();

        Ok(DecryptFieldsResult {
            decrypted_data_attributes,
            result_map,
        })
    }

    pub async fn decrypt_document(
        &self,
        state: &web::Data<State>,
        document_type: String,
    ) -> Result<Vec<DecryptDocumentResult>, ApiError> {
        let images = self
            .get_encrypted_images_from_s3(state, document_type)
            .await
            .into_iter()
            .collect::<Result<Vec<_>, _>>()?; // Error with whatever the first error is

        let sealed_keys = images.iter().map(|i| i.e_data_key.clone()).collect();
        let unsealed_keys: Vec<ScopedSealingKey> = self
            .decrypt_data_keys(state, sealed_keys, IdentityDocument::DATA_KEY_SCOPE)
            .await?;
        let res: Result<Vec<DecryptDocumentResult>, _> = images
            .into_iter()
            .zip(unsealed_keys.iter())
            .map(|(image, key)| -> Result<DecryptDocumentResult, _> {
                let front = Base64Data(key.unseal_bytes(AeadSealedBytes(image.front_image.0))?);
                // Back is optional for some documents
                let mut back: Option<Base64Data> = None;
                if let Some(b) = image.back_image {
                    back = Some(Base64Data(key.unseal_bytes(AeadSealedBytes(b.0))?));
                }

                Ok(DecryptDocumentResult {
                    identity_document_id: image.identity_document_id.clone(),
                    // TODO: perhaps we should have a PiiBase64Bytes type
                    front: PiiString::from(front.to_string_standard()),
                    back: back.map(|b| PiiString::from(b.to_string_standard())),
                })
            })
            .collect();

        res
    }
}

use crate::{errors::ApiError, utils::user_vault_wrapper::UserVaultWrapper, State};
use crypto::aead::AeadSealedBytes;
use db::{
    models::{user_vault::UserVault},
    HasDataAttributeFields,
};
use newtypes::{Base64Data, DataAttribute, IdentityDocumentId, PiiString, SealedVaultBytes};
use paperclip::actix::web;
use std::collections::HashMap;

pub mod access_events;
pub mod authorized_orgs;
pub mod biometric;
pub mod decrypt;
pub mod document;
pub mod email;
pub mod identity_data;
pub mod index;
pub mod liveness;
pub mod token;

pub fn routes(config: &mut web::ServiceConfig) {
    let document_json_cfg = web::JsonConfig::default()
        // limit request payload size to 5MB
        // see backend/components/api/src/routes/hosted/user/document.rs::TODO::6 for discussion
        .limit(5_000_000)
        // accept any content type
        .content_type(|_| true)
        // use custom error handler
        .error_handler(|err, _req| actix_web::Error::from(ApiError::InvalidJsonBody(err)));

    config
        .service(index::get)
        .service(authorized_orgs::get)
        .service(identity_data::post)
        .service(decrypt::post)
        .service(access_events::get)
        .service(biometric::init_post)
        .service(biometric::complete_post)
        .service(document::get)
        .service(document::post)
        .app_data(document_json_cfg)
        .service(liveness::get)
        .service(token::get)
        .service(email::post)
        .service(email::verify::post)
        .service(email::challenge::post);
}

pub struct DecryptFieldsResult {
    pub decrypted_data_attributes: Vec<DataAttribute>,
    pub result_map: HashMap<DataAttribute, Option<PiiString>>,
}

pub struct DecryptDocumentResult {
    pub identity_document_id: IdentityDocumentId,
    pub front: PiiString,
    pub back: Option<PiiString>,
}

/// TODO: potentially move this to UVW
pub async fn decrypt(
    state: &web::Data<State>,
    user_vault: UserVault,
    data_attributes: Vec<DataAttribute>,
) -> Result<DecryptFieldsResult, ApiError> {
    // Filter out fields that don't have values set on the user vault
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::build(conn, user_vault))
        .await??;
    let (fields_to_decrypt, e_datas): (Vec<DataAttribute>, Vec<&SealedVaultBytes>) = data_attributes
        .iter()
        .filter_map(|kind| uvw.get_e_field(*kind).map(|data| (kind, data)))
        .unzip();

    // Actually decrypt the fields
    let decrypt_response = uvw.decrypt(state, e_datas).await?;
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

/// TODO: potentially move this to UVW
pub async fn decrypt_document(
    state: &web::Data<State>,
    user_vault: UserVault,
    document_type: String,
) -> Result<Vec<DecryptDocumentResult>, ApiError> {
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::build(conn, user_vault))
        .await??;

    let images = uvw
        .get_encrypted_images_from_s3(state, document_type)
        .await
        .into_iter()
        .collect::<Result<Vec<_>, _>>()?; // Error with whatever the first error is

    let sealed_keys = images.iter().map(|i| i.e_data_key.clone()).collect();
    let unsealed_keys = uvw.decrypt_data_keys(state, sealed_keys).await?;
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

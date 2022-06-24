use crate::{
    auth::{session_data::UserVaultPermissions, AuthError},
    errors::ApiError,
    State,
};
use crypto::seal::EciesP256Sha256AesGcmSealed;
use db::models::user_vaults::UserVault;
use enclave_proxy::{DataTransform, DecryptRequest};
use newtypes::DataKind;
use paperclip::actix::web;
use std::collections::HashMap;

use crate::utils::email::clean_email;

pub mod access_events;
pub mod biometric;
pub mod data;
pub mod decrypt;
pub mod detail;
pub mod email_verify;

pub fn routes() -> web::Scope {
    web::scope("/user")
        .service(web::resource("").route(web::get().to(detail::handler)))
        .service(data::handler)
        .service(email_verify::handler)
        .service(decrypt::handler)
        .service(access_events::handler)
        .service(biometric::init)
        .service(biometric::complete)
}

pub fn clean_for_storage(data_kind: DataKind, data_str: String) -> String {
    match data_kind {
        DataKind::Email => clean_email(data_str),
        _ => data_str,
    }
}

pub fn clean_for_fingerprint(data_str: String) -> String {
    data_str.to_lowercase().trim().to_string()
}

pub struct DecryptFieldsResult {
    pub fields_to_decrypt: Vec<DataKind>,
    pub result_map: HashMap<DataKind, Option<String>>,
}

pub async fn decrypt<C: UserVaultPermissions>(
    session: &C,
    state: &web::Data<State>,
    user_vault: UserVault,
    data_kinds: Vec<DataKind>,
) -> Result<DecryptFieldsResult, ApiError> {
    if !session.can_decrypt() {
        Err(AuthError::UnauthorizedOperation)?
    }
    // Filter out fields that don't have values set on the user vault
    let (fields_to_decrypt, values_to_decrypt): (Vec<DataKind>, Vec<Vec<u8>>) =
        db::user_data::filter(&state.db_pool, user_vault.id.clone(), data_kinds.clone())
            .await?
            .into_iter()
            .map(|user_data| (user_data.data_kind, user_data.e_data))
            .unzip();

    // Actually decrypt the fields
    let requests = values_to_decrypt
        .into_iter()
        .map(|sealed_data| {
            Ok(DecryptRequest {
                sealed_data: EciesP256Sha256AesGcmSealed::from_bytes(&sealed_data)?,
                transform: DataTransform::Identity,
            })
        })
        .collect::<Result<Vec<DecryptRequest>, crypto::Error>>()?;
    let decrypt_response = crate::enclave::decrypt(state, requests, user_vault.e_private_key.clone()).await?;
    if decrypt_response.len() != fields_to_decrypt.len() {
        return Err(ApiError::InvalidEnclaveDecryptResponse);
    }
    let decrypted_data: HashMap<DataKind, String> = decrypt_response
        .into_iter()
        .enumerate()
        .map(|(i, result)| (fields_to_decrypt[i], result))
        .collect();
    let result_map: HashMap<DataKind, Option<String>> = data_kinds
        .into_iter()
        .enumerate()
        .map(|(_, data_kind)| (data_kind, decrypted_data.get(&data_kind).cloned()))
        .collect();
    Ok(DecryptFieldsResult {
        fields_to_decrypt,
        result_map,
    })
}

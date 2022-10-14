use crate::{errors::ApiError, utils::user_vault_wrapper::UserVaultWrapper, State};
use db::models::{identity_data::HasIdentityDataFields, user_vault::UserVault};
use newtypes::{DataAttribute, PiiString, SealedVaultBytes};
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

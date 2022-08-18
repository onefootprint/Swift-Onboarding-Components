use crate::{errors::ApiError, utils::user_vault_wrapper::UserVaultWrapper, State};
use db::models::{identity_data::HasIdentityDataFields, user_vault::UserVault};
use newtypes::{DataKind, PiiString, SealedVaultBytes};
use paperclip::actix::web;
use std::collections::HashMap;

pub mod access_events;
pub mod authorized_orgs;
pub mod biometric;
pub mod decrypt;
pub mod detail;
pub mod email;
pub mod identity_data;
pub mod liveness;
pub mod token;

pub fn routes() -> web::Scope {
    web::scope("/user")
        .service(web::resource("").route(web::get().to(detail::handler)))
        .service(authorized_orgs::handler)
        .service(identity_data::handler)
        .service(decrypt::handler)
        .service(access_events::handler)
        .service(biometric::init)
        .service(biometric::complete)
        .service(liveness::get)
        .service(token::get)
        .service(email::routes())
}

pub struct DecryptFieldsResult {
    pub decrypted_data_kinds: Vec<DataKind>,
    pub result_map: HashMap<DataKind, Option<PiiString>>,
}

pub async fn decrypt(
    state: &web::Data<State>,
    user_vault: UserVault,
    data_kinds: Vec<DataKind>,
) -> Result<DecryptFieldsResult, ApiError> {
    // Filter out fields that don't have values set on the user vault
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::build(conn, user_vault))
        .await??;
    let (fields_to_decrypt, e_datas): (Vec<DataKind>, Vec<&SealedVaultBytes>) = data_kinds
        .iter()
        .filter_map(|kind| uvw.get_e_field(*kind).map(|data| (kind, data)))
        .unzip();

    // Actually decrypt the fields
    let decrypt_response = uvw.decrypt(state, e_datas).await?;
    let decrypted_data: HashMap<DataKind, PiiString> = decrypt_response
        .into_iter()
        .enumerate()
        .map(|(i, result)| (fields_to_decrypt[i], result))
        .collect();
    let result_map: HashMap<DataKind, Option<PiiString>> = data_kinds
        .into_iter()
        .enumerate()
        .map(|(_, data_kind)| (data_kind, decrypted_data.get(&data_kind).cloned()))
        .collect();
    let decrypted_data_kinds = result_map.iter().map(|(kind, _)| *kind).collect();
    Ok(DecryptFieldsResult {
        decrypted_data_kinds,
        result_map,
    })
}

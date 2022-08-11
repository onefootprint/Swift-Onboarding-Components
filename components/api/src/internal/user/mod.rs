use crate::{auth::AuthError, errors::ApiError, State};
use crypto::seal::EciesP256Sha256AesGcmSealed;
use db::models::{ob_configurations::ObConfiguration, user_vaults::UserVault};
use enclave_proxy::{DataTransform, DecryptRequest};
use newtypes::{DataKind, PiiString, ScopedUserId, SealedVaultBytes};
use paperclip::actix::web;
use std::collections::{HashMap, HashSet};

pub mod access_events;
pub mod authorized_orgs;
pub mod biometric;
pub mod data;
pub mod decrypt;
pub mod detail;
pub mod email;
pub mod liveness;
pub mod token;

pub fn routes() -> web::Scope {
    web::scope("/user")
        .service(web::resource("").route(web::get().to(detail::handler)))
        .service(authorized_orgs::handler)
        .service(data::handler)
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
    scoped_user_id: Option<&ScopedUserId>,
    data_kinds: Vec<DataKind>,
) -> Result<DecryptFieldsResult, ApiError> {
    if let Some(scoped_user_id) = scoped_user_id {
        let ob_configs =
            ObConfiguration::list_for_scoped_user(&state.db_pool, scoped_user_id.clone()).await?;
        let data_to_access_kinds: HashSet<_> = data_kinds.iter().map(|x| x.to_owned()).collect();
        let can_access_kinds: HashSet<_> = ob_configs
            .into_iter()
            .flat_map(|x| x.can_access_data_kinds)
            .flat_map(|x| x.permissioning_kinds())
            .collect();
        if !can_access_kinds.is_superset(&data_to_access_kinds) {
            return Err(AuthError::UnauthorizedOperation.into());
        }
    }

    // Filter out fields that don't have values set on the user vault
    let (fields_to_decrypt, values_to_decrypt): (Vec<DataKind>, Vec<SealedVaultBytes>) =
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
                sealed_data: EciesP256Sha256AesGcmSealed::from_bytes(sealed_data.as_ref())?,
                transform: DataTransform::Identity,
            })
        })
        .collect::<Result<Vec<DecryptRequest>, crypto::Error>>()?;
    let decrypt_response = crate::enclave::decrypt(state, requests, &user_vault.e_private_key).await?;
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

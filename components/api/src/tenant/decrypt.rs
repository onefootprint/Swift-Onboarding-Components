use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::client_secret_key::SecretTenantAuthContext, errors::ApiError};
use crypto::seal::EciesP256Sha256AesGcmSealed;
use db::models::access_events::{NewAccessEvent, NewAccessEventBatch};
use db::models::user_vaults::{UserVault, UserVaultWrapper};
use enclave_proxy::{DataTransform, DecryptRequest};
use newtypes::{DataKind, FootprintUserId};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::HashMap;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    footprint_user_id: FootprintUserId,
    attributes: Vec<DataKind>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptResponse {
    pub attributes: HashMap<DataKind, String>,
}

#[api_v2_operation]
#[post("/decrypt")]
/// Allows a tenant to decrypt a specific user's data. The user requested must be onboarded onto
/// the requesting tenant.
/// Requires tenant secret key auth.
fn handler(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    // grab tenant secret key from header
    let tenant = auth.tenant();

    // look up tenant & user vault
    let (vault, onboarding) = db::user_vault::get_by_tenant_and_onboarding(
        &state.db_pool,
        tenant.id.clone(),
        request.footprint_user_id.clone(),
    )
    .await?
    .ok_or(ApiError::InvalidTenantKeyOrUserId)?;

    let DecryptFieldsResult {
        fields_to_decrypt,
        result_map,
    } = decrypt_fields(&state, request.attributes.clone(), &vault).await?;

    // Create an AccessEvent logs showing that the tenant accessed these fields
    let events = fields_to_decrypt
        .iter()
        .map(|data_kind| NewAccessEvent {
            onboarding_id: onboarding.id.clone(),
            data_kind: *data_kind,
        })
        .collect();
    NewAccessEventBatch(events)
        .bulk_insert(&state.db_pool)
        .await?;

    Ok(Json(ApiResponseData {
        data: UserDecryptResponse {
            attributes: result_map,
        },
    }))
}

pub struct DecryptFieldsResult {
    pub fields_to_decrypt: Vec<DataKind>,
    pub result_map: HashMap<DataKind, String>,
}

pub async fn decrypt_fields(
    state: &web::Data<State>,
    fields: Vec<DataKind>,
    vault: &UserVault,
) -> Result<DecryptFieldsResult, ApiError> {
    let uvw = UserVaultWrapper::from(&state.db_pool, vault).await?;
    // Filter out fields that don't have values set on the user vault
    let (fields_to_decrypt, values_to_decrypt): (Vec<DataKind>, Vec<&[u8]>) = fields
        .into_iter()
        .filter_map(|field_kind| Some((field_kind, uvw.get_field(field_kind)?)))
        .unzip();

    // Actually decrypt the fields
    let requests = values_to_decrypt
        .into_iter()
        .map(|sealed_data| {
            Ok(DecryptRequest {
                sealed_data: EciesP256Sha256AesGcmSealed::from_bytes(sealed_data)?,
                transform: DataTransform::Identity,
            })
        })
        .collect::<Result<Vec<DecryptRequest>, crypto::Error>>()?;
    let decrypt_response =
        crate::enclave::lib::decrypt(state, requests, vault.e_private_key.clone()).await?;
    if decrypt_response.len() != fields_to_decrypt.len() {
        return Err(ApiError::InvalidEnclaveDecryptResponse);
    }
    let result_map: HashMap<DataKind, String> = decrypt_response
        .into_iter()
        .enumerate()
        .map(|(i, result)| (fields_to_decrypt[i], result))
        .collect();
    Ok(DecryptFieldsResult {
        fields_to_decrypt,
        result_map,
    })
}

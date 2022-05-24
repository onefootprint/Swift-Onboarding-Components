use crate::errors::ApiError;
use crate::tenant::AuthContext;
use crate::types::success::ApiResponseData;
use crate::State;
use crypto::seal::EciesP256Sha256AesGcmSealed;
use db::models::access_events::{NewAccessEvent, NewAccessEventBatch};
use db::models::user_vaults::UserVault;
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

type UserDecryptResponse = HashMap<DataKind, String>;

#[api_v2_operation]
#[post("/decrypt")]
/// Allows a tenant to decrypt a specific user's data. The user requested must be onboarded onto
/// the requesting tenant.
/// Requires tenant secret key auth.
fn handler(
    state: web::Data<State>,
    auth: AuthContext,
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
    // TODO potentially log encrypted email as well attributing it to specific person
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
        data: result_map,
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
    // Filter out fields that don't have values set on the user vault
    let (fields_to_decrypt, values_to_decrypt): (Vec<DataKind>, Vec<Vec<u8>>) =
        db::user_data::filter(&state.db_pool, vault.id.clone(), fields)
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

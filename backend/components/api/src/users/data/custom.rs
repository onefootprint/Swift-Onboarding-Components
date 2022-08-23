//! Get custom data from a user vault

use std::collections::{HashMap, HashSet};

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::{HasTenant, IsLive};

use crate::types::{ApiResponseData, EmptyResponse, JsonApiResponse};

use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};

use db::models::kv_data::KeyValueData;
use db::models::user_vault::UserVault;
use newtypes::csv::Csv;
use newtypes::{flat_api_object_map_type, FootprintUserId, KvDataKey, KvScope, PiiString, ScopedKvDataKey};

use paperclip::actix::{api_v2_operation, web, web::Json, web::Path, web::Query};
use paperclip::actix::{post, Apiv2Schema};
use serde::{Deserialize, Serialize};

flat_api_object_map_type!(
    PutCustomDataRequest<KvDataKey, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "ach_account_number": "1234567890", "cc_last_4": "4242" }"#
);

/// store custom data
#[api_v2_operation(tags(PublicApi))]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<PutCustomDataRequest>,
    tenant_auth: SecretTenantAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;

    let (user_vault, _scoped_user) = state
        .db_pool
        .db_query(move |conn| UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live))
        .await??;

    let update = request.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();

    // TODO: add updates to security log

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let uvw = UserVaultWrapper::lock(conn, &user_vault.id)?;
            uvw.update_custom_data(conn, tenant_id, update.into())?;
            Ok(())
        })
        .await?;

    ApiResponseData::ok(EmptyResponse).json()
}

/**
 * Fetch status
 */
#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct FieldsParams {
    /// Comma separated list of fields to check
    #[openapi(example = "ach_account_number,cc_last_4")]
    fields: Csv<KvDataKey>,
}

flat_api_object_map_type!(
    GetCustomDataResponse<KvDataKey, bool>,
    description="A key-value map indicating what fields are present",
    example=r#"{ "ach_account_number": true, "cc_last_4": false }"#
);

/// check if fields exist
#[api_v2_operation(tags(PublicApi))]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    tenant_auth: SecretTenantAuthContext,
) -> JsonApiResponse<GetCustomDataResponse> {
    let footprint_user_id = path.into_inner();
    let is_live = tenant_auth.is_live()?;

    let fields: Vec<ScopedKvDataKey> = request
        .into_inner()
        .fields
        .iter()
        .map(|k| k.clone().ensure_scoped(KvScope::Custom))
        .collect();

    let scoped_data_keys = fields.clone();
    let tenant_id = tenant_auth.tenant().id.clone();

    let results = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (user_vault, _) = UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;
            let found = KeyValueData::get_all(conn, user_vault.id, tenant_id, &scoped_data_keys)?;
            Ok(found)
        })
        .await??;

    // and these are the ones that have values in our vault
    let result_fields: HashSet<ScopedKvDataKey> =
        HashSet::from_iter(results.into_iter().map(|kv| kv.data_key));

    let output = HashMap::from_iter(fields.into_iter().map(|field| {
        let exists = result_fields.contains(&field);
        (field.clear_scope(KvScope::Custom), exists)
    }));

    ApiResponseData::ok(GetCustomDataResponse::from(output)).json()
}

/**
 * Decrypt
 */
#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct DecryptCustomFieldsRequest {
    /// attributes to decrypt
    fields: Vec<KvDataKey>,

    /// reason for the data decryption
    reason: String,
}

flat_api_object_map_type!(
    DecryptCustomDataResponse<KvDataKey, PiiString>,
    description="A key-value map with the corresponding decrypted 'custom' values",
    example=r#"{ "ach_account_number": "121212121212", "cc_last_4": "4242 }"#
);

/// decrypt custom data
#[api_v2_operation(tags(PublicApi))]
#[post("/custom/decrypt")]
pub async fn post_decrypt(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptCustomFieldsRequest>,
    tenant_auth: SecretTenantAuthContext,
) -> JsonApiResponse<DecryptCustomDataResponse> {
    let footprint_user_id = path.into_inner();
    let is_live = tenant_auth.is_live()?;
    let tenant_id = tenant_auth.tenant().id.clone();
    let scoped_data_keys: Vec<ScopedKvDataKey> = request
        .into_inner()
        .fields
        .into_iter()
        .map(|k| k.ensure_scoped(KvScope::Custom))
        .collect();

    let (user_vault, results) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (user_vault, _) = UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;
            let found = KeyValueData::get_all(conn, user_vault.id.clone(), tenant_id, &scoped_data_keys)?;
            Ok((user_vault, found))
        })
        .await??;

    let decrypted = decrypt_inner(&state, user_vault, &results).await?;
    let fields_and_pii = results
        .into_iter()
        .map(|kv| kv.data_key.clear_scope(KvScope::Custom))
        .zip(decrypted);
    let output = HashMap::from_iter(fields_and_pii);

    ApiResponseData::ok(DecryptCustomDataResponse::from(output)).json()
}

async fn decrypt_inner(
    state: &State,
    user_vault: UserVault,
    kv_data: &[KeyValueData],
) -> Result<Vec<PiiString>, ApiError> {
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::build(conn, user_vault))
        .await??;

    let e_datas = kv_data.iter().map(|kv| &kv.e_data).collect();
    // Actually decrypt the fields
    let decrypt_response = uvw.decrypt(state, e_datas).await?;
    Ok(decrypt_response)
}

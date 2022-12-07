//! Get custom data from a user vault

use std::collections::{HashMap, HashSet};

use crate::auth::tenant::{CheckTenantPermissions, SecretTenantAuthContext, TenantAuth, WorkOsAuthContext};
use crate::auth::Either;

use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse, ResponseData};

use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};

use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::kv_data::KeyValueData;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use db::TxnPgConnection;
use newtypes::csv::Csv;
use newtypes::{
    flat_api_object_map_type, AccessEventKind, DataIdentifier, FootprintUserId, KvDataKey, PiiString,
    TenantPermission,
};

use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path, web::Query};
use serde::{Deserialize, Serialize};

flat_api_object_map_type!(
    PutCustomDataRequest<KvDataKey, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "ach_account_number": "1234567890", "cc_last_4": "4242" }"#
);

#[api_v2_operation(description = "Stores custom data.", tags(Users, PublicApi))]
#[actix::put("/users/{footprint_user_id}/vault/custom")]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<PutCustomDataRequest>,
    tenant_auth: SecretTenantAuthContext,
    insights: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let update = request.into_inner();
    let insight = CreateInsightEvent::from(insights);

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (user_vault, scoped_user) =
                UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;
            let mut uvw = UserVaultWrapper::lock(conn, &user_vault.id)?;
            put_internal(conn, &mut uvw, &tenant_auth, &scoped_user, insight, update)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

pub fn put_internal(
    conn: &mut TxnPgConnection,
    uvw: &mut UserVaultWrapper,
    tenant_auth: &SecretTenantAuthContext,
    scoped_user: &ScopedUser,
    insight: CreateInsightEvent,
    update: PutCustomDataRequest,
) -> ApiResult<()> {
    // Create an AccessEvent log showing that the tenant updated these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: None,
        principal: tenant_auth.format_principal(),
        insight,
        kind: AccessEventKind::Update,
        targets: update.keys().cloned().map(DataIdentifier::Custom).collect(),
    }
    .create(conn)?;
    uvw.update_custom_data(conn, tenant_auth.tenant().id.clone(), update.into())?;
    Ok(())
}

/**
 * Fetch status
 */
#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct FieldsParams {
    /// Comma separated list of fields to check
    #[openapi(example = "ach_account_number,cc_last_4")]
    pub fields: Csv<KvDataKey>,
}

flat_api_object_map_type!(
    GetCustomDataResponse<KvDataKey, bool>,
    description="A key-value map indicating what fields are present",
    example=r#"{ "ach_account_number": true, "cc_last_4": false }"#
);

#[api_v2_operation(description = "Checks if fields exist.", tags(Vault, PublicApi, Users))]
#[actix::get("/users/{footprint_user_id}/vault/custom")]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    tenant_auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetCustomDataResponse> {
    get_internal(state, path, request, tenant_auth).await
}

pub(super) async fn get_internal(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    tenant_auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetCustomDataResponse> {
    let tenant_auth = tenant_auth.check_permissions(vec![TenantPermission::Users])?;
    let footprint_user_id = path.into_inner();
    let is_live = tenant_auth.is_live()?;

    let tenant_id = tenant_auth.tenant().id.clone();
    let fields: Vec<KvDataKey> = request.into_inner().fields.0;

    let fields_copy = fields.clone();
    let results = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (user_vault, _) = UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;
            let found = KeyValueData::get_all(conn, user_vault.id, tenant_id, &fields_copy)?;
            Ok(found)
        })
        .await??;

    // and these are the ones that have values in our vault
    let result_fields: HashSet<KvDataKey> = HashSet::from_iter(results.into_iter().map(|kv| kv.data_key));

    let output = HashMap::from_iter(fields.into_iter().map(|field| {
        let exists = result_fields.contains(&field);
        (field, exists)
    }));

    ResponseData::ok(GetCustomDataResponse::from(output)).json()
}

/**
 * Decrypt
 */
#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct DecryptCustomFieldsRequest {
    /// attributes to decrypt
    pub fields: Vec<KvDataKey>,

    /// reason for the data decryption
    pub reason: String,
}

flat_api_object_map_type!(
    DecryptCustomDataResponse<KvDataKey, PiiString>,
    description="A key-value map with the corresponding decrypted 'custom' values",
    example=r#"{ "ach_account_number": "121212121212", "cc_last_4": "4242" }"#
);

#[api_v2_operation(description = "Decrypts custom data from the vault.", tags(Users, PublicApi))]
#[actix::post("/users/{footprint_user_id}/vault/custom/decrypt")]
pub async fn post_decrypt(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptCustomFieldsRequest>,
    tenant_auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptCustomDataResponse> {
    post_decrypt_internal(state, path, request, tenant_auth, insights).await
}

pub(super) async fn post_decrypt_internal(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptCustomFieldsRequest>,
    tenant_auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptCustomDataResponse> {
    let tenant_auth = tenant_auth.check_permissions(vec![TenantPermission::DecryptCustom])?;
    let footprint_user_id = path.into_inner();
    let is_live = tenant_auth.is_live()?;
    let tenant_id = tenant_auth.tenant().id.clone();
    let DecryptCustomFieldsRequest { fields, reason } = request.into_inner();

    let fields_copy = fields.clone();
    let (user_vault, scoped_user, results) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (user_vault, scoped_user) =
                UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;
            let found = KeyValueData::get_all(conn, user_vault.id.clone(), tenant_id, &fields_copy)?;
            Ok((user_vault, scoped_user, found))
        })
        .await??;

    let decrypted = decrypt_inner(&state, user_vault, &results).await?;
    let output: HashMap<_, _> = results.into_iter().map(|kv| kv.data_key).zip(decrypted).collect();

    // Create an AccessEvent log showing that the tenant accessed these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: Some(reason),
        principal: tenant_auth.format_principal(),
        insight: CreateInsightEvent::from(insights),
        kind: AccessEventKind::Decrypt,
        targets: fields.into_iter().map(DataIdentifier::Custom).collect(),
    }
    .save(&state.db_pool)
    .await?;

    ResponseData::ok(DecryptCustomDataResponse::from(output)).json()
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

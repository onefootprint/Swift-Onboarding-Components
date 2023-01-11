//! Get custom data from a user vault

use std::collections::{HashMap, HashSet};

use crate::auth::tenant::{
    CheckTenantGuard, SecretTenantAuthContext, TenantAuth, TenantGuard, TenantUserAuthContext,
};
use crate::auth::Either;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse, ResponseData};
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UvwAddData;
use crate::utils::user_vault_wrapper::{LockedUserVaultWrapper, UserVaultWrapper};
use crate::{errors::ApiError, State};
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use db::TxnPgConnection;
use newtypes::csv::Csv;
use newtypes::{
    flat_api_object_map_type, AccessEventKind, DataIdentifier, FootprintUserId, KvDataKey, PiiString,
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
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::lock_for_tenant(conn, &scoped_user.id)?;
            put_internal(conn, uvw, &tenant_auth, &scoped_user, insight, update)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

pub fn put_internal(
    conn: &mut TxnPgConnection,
    uvw: LockedUserVaultWrapper,
    tenant_auth: &SecretTenantAuthContext,
    scoped_user: &ScopedUser,
    insight: CreateInsightEvent,
    update: PutCustomDataRequest,
) -> ApiResult<()> {
    // Create an AccessEvent log showing that the tenant updated these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: None,
        principal: tenant_auth.actor().into(),
        insight,
        kind: AccessEventKind::Update,
        targets: update.keys().cloned().map(DataIdentifier::Custom).collect(),
    }
    .create(conn)?;
    uvw.update_custom_data(conn, update.into())?;
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
    tenant_auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetCustomDataResponse> {
    get_internal(state, path, request, tenant_auth).await
}

pub(super) async fn get_internal(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    tenant_auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetCustomDataResponse> {
    let tenant_auth = tenant_auth.check_guard(TenantGuard::Read)?;
    let footprint_user_id = path.into_inner();
    let is_live = tenant_auth.is_live()?;

    let tenant_id = tenant_auth.tenant().id.clone();
    let fields: Vec<KvDataKey> = request.into_inner().fields.0;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await??;

    // and these are the ones that have values in our vault
    let result_fields: HashSet<_> = uvw.kv_data().keys().collect();

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
    tenant_auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptCustomDataResponse> {
    post_decrypt_internal(state, path, request, tenant_auth, insights).await
}

pub(super) async fn post_decrypt_internal(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptCustomFieldsRequest>,
    tenant_auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptCustomDataResponse> {
    let tenant_auth = tenant_auth.check_guard(TenantGuard::DecryptCustom)?;
    let footprint_user_id = path.into_inner();
    let is_live = tenant_auth.is_live()?;
    let tenant_id = tenant_auth.tenant().id.clone();
    let DecryptCustomFieldsRequest { fields, reason } = request.into_inner();

    let (uvw, scoped_user) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok((uvw, scoped_user))
        })
        .await??;

    let (existing_keys, e_datas): (Vec<_>, Vec<_>) = fields
        .iter()
        .flat_map(|k| uvw.kv_data().get(k))
        .map(|d| (&d.data_key, &d.e_data))
        .unzip();

    // Since this is custom data, requester has access to everything committed in the vault
    let decrypted = uvw.decrypt(&state, e_datas).await?;
    let output: HashMap<_, _> = existing_keys.into_iter().cloned().zip(decrypted).collect();

    // Create an AccessEvent log showing that the tenant accessed these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: Some(reason),
        principal: tenant_auth.actor().into(),
        insight: CreateInsightEvent::from(insights),
        kind: AccessEventKind::Decrypt,
        targets: fields.into_iter().map(DataIdentifier::Custom).collect(),
    }
    .save(&state.db_pool)
    .await?;

    ResponseData::ok(DecryptCustomDataResponse::from(output)).json()
}

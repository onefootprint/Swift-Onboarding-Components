use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::errors::ApiResult;
use crate::types::{
    JsonApiResponse,
    ResponseData,
};
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::tenant::AuthActor;
use api_core::errors::tenant::TenantError;
use api_core::types::{
    OffsetPaginatedResponse,
    OffsetPaginationRequest,
};
use api_wire_types::ApiKeyFilters;
use db::models::tenant_api_key::{
    ApiKeyListFilters,
    TenantApiKey,
};
use db::models::tenant_role::TenantRole;
use db::{
    DbError,
    OffsetPagination,
};
use newtypes::secret_api_key::SecretApiKey;
use newtypes::{
    ApiKeyStatus,
    TenantApiKeyId,
    TenantRoleId,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    patch,
    web,
    Apiv2Schema,
};

type ApiKeysResponse = Json<OffsetPaginatedResponse<api_wire_types::SecretApiKey>>;

#[api_v2_operation(
    description = "Lists the tenant's secret API keys",
    tags(ApiKeys, Organization, Private)
)]
#[actix::get("/org/api_keys")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<ApiKeyFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantSessionAuth,
) -> ApiResult<ApiKeysResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let page = pagination.page;
    let page_size = pagination.page_size(&state);
    let ApiKeyFilters {
        role_ids,
        status,
        search,
    } = filters.into_inner();
    let role_ids = role_ids.map(|r_ids| r_ids.0);

    let query = ApiKeyListFilters {
        tenant_id: auth.tenant().id.clone(),
        is_live: auth.is_live()?,
        role_ids,
        status,
        search,
    };
    let pagination = OffsetPagination::new(page, page_size);
    let (keys, next_page, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let (keys, next_page) = TenantApiKey::list(conn, &query, pagination)?;
            let count = TenantApiKey::count(conn, &query)?;
            Ok((keys, next_page, count))
        })
        .await?;

    let results = keys
        .into_iter()
        .map(|(key, role)| (key, role, None))
        .map(api_wire_types::SecretApiKey::from_db)
        .collect::<Vec<api_wire_types::SecretApiKey>>();
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateApiKeyRequest {
    name: String,
    role_id: TenantRoleId,
}

#[api_v2_operation(
    description = "Generates a new secret tenant api key.",
    tags(ApiKeys, Organization, Private)
)]
#[actix::post("/org/api_keys")]
pub async fn post(
    state: web::Data<State>,
    // Don't allow updating an API key with an API key...
    auth: TenantSessionAuth,
    request: web::Json<CreateApiKeyRequest>,
) -> JsonApiResponse<api_wire_types::SecretApiKey> {
    let auth = auth.check_guard(TenantGuard::ApiKeys)?;
    let is_live = auth.is_live()?;
    let secret_key = SecretApiKey::generate(is_live);
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let sh_key = secret_key.fingerprint(state.as_ref()).await?;
    let e_key = secret_key.seal_to(&tenant.public_key)?;
    let CreateApiKeyRequest { name, role_id } = request.into_inner();
    let (api_key, role) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let api_key = TenantApiKey::create(conn, name, sh_key, e_key, tenant_id, is_live, role_id)?;
            let role = TenantRole::get(conn, &api_key.role_id)?;
            Ok((api_key, role))
        })
        .await?;

    Ok(Json(ResponseData::ok(api_wire_types::SecretApiKey::from_db((
        api_key,
        role,
        Some(secret_key),
    )))))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateApiKeyRequest {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
    role_id: Option<TenantRoleId>,
}

#[api_v2_operation(
    description = "Updates an existing secret tenant api key.",
    tags(ApiKeys, Organization, Private)
)]
#[patch("/org/api_keys/{id}")]
pub async fn patch(
    state: web::Data<State>,
    // Don't allow updating an API key with an API key...
    auth: TenantSessionAuth,
    path: web::Path<TenantApiKeyId>,
    request: web::Json<UpdateApiKeyRequest>,
) -> JsonApiResponse<api_wire_types::SecretApiKey> {
    let auth = auth.check_guard(TenantGuard::ApiKeys)?;
    let id = path.into_inner();
    if let AuthActor::TenantApiKey(key_id) = auth.actor() {
        if key_id == id {
            return Err(TenantError::CannotEditCurrentApiKey.into());
        }
    }
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let UpdateApiKeyRequest {
        name,
        status,
        role_id,
    } = request.into_inner();
    let (api_key, role) = state
        .db_pool
        .db_transaction(move |conn| {
            TenantApiKey::update(conn, id, tenant_id, is_live, name, status, role_id, None)
        })
        .await?;

    Ok(Json(ResponseData::ok(api_wire_types::SecretApiKey::from_db((
        api_key, role, None,
    )))))
}

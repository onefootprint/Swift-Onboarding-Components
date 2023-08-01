use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard, TenantSessionAuth};
use crate::auth::Either;
use crate::errors::ApiResult;
use crate::types::CursorPaginationRequest;
use crate::types::JsonApiResponse;
use crate::types::{CursorPaginatedResponse, ResponseData};
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::tenant::AuthActor;
use api_core::errors::tenant::TenantError;
use api_wire_types::ApiKeyFilters;
use chrono::{DateTime, Utc};
use db::models::tenant_api_key::{ApiKeyListFilters, TenantApiKey};
use db::models::tenant_role::TenantRole;
use db::DbError;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::{ApiKeyStatus, TenantApiKeyId, TenantRoleId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, patch, web, web::Json};

type ApiKeysResponse = Json<CursorPaginatedResponse<Vec<api_wire_types::SecretApiKey>, DateTime<Utc>>>;

#[api_v2_operation(
    description = "Lists the tenant's secret API keys",
    tags(Organization, Private)
)]
#[actix::get("/org/api_keys")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<ApiKeyFilters>,
    pagination: web::Query<CursorPaginationRequest<DateTime<Utc>>>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> ApiResult<ApiKeysResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let page_size = pagination.page_size(&state);
    let cursor = pagination.cursor;
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
    let (keys, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let keys = TenantApiKey::list(conn, &query, cursor, (page_size + 1) as i64)?;
            let count = TenantApiKey::count(conn, &query)?;
            Ok((keys, count))
        })
        .await??;

    let cursor = pagination.cursor_item(&state, &keys).map(|x| x.0.created_at);
    let keys = keys
        .into_iter()
        .take(page_size)
        .map(|(key, role)| (key, role, None))
        .map(api_wire_types::SecretApiKey::from_db)
        .collect::<Vec<api_wire_types::SecretApiKey>>();
    Ok(Json(CursorPaginatedResponse::ok(keys, cursor, Some(count))))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateApiKeyRequest {
    name: String,
    role_id: Option<TenantRoleId>,
}

#[api_v2_operation(
    description = "Generates a new secret tenant api key.",
    tags(Organization, Private)
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
    tags(Organization, Private)
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

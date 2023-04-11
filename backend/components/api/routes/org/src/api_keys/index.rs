use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard, TenantSessionAuth};
use crate::auth::Either;
use crate::errors::ApiResult;
use crate::types::CursorPaginationRequest;
use crate::types::JsonApiResponse;
use crate::types::{CursorPaginatedResponse, ResponseData};
use crate::utils::db2api::DbToApi;
use crate::State;
use chrono::{DateTime, Utc};
use db::models::tenant_api_key::{ApiKeyListQuery, TenantApiKey};
use db::models::tenant_api_key_access_log::TenantApiKeyAccessLog;
use db::DbError;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::{ApiKeyStatus, TenantApiKeyId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, patch, web, web::Json};

type ApiKeysResponse = Json<CursorPaginatedResponse<Vec<api_wire_types::SecretApiKey>, DateTime<Utc>>>;

#[api_v2_operation(
    description = "Lists the tenant's secret API keys",
    tags(Organization, Preview)
)]
#[actix::get("/org/api_keys")]
pub async fn get(
    state: web::Data<State>,
    pagination: web::Query<CursorPaginationRequest<DateTime<Utc>>>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> ApiResult<ApiKeysResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let page_size = pagination.page_size(&state);
    let cursor = pagination.cursor;

    let query = ApiKeyListQuery {
        tenant_id: auth.tenant().id.clone(),
        is_live: auth.is_live()?,
    };
    let (keys, id_to_last_used, count) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let keys = TenantApiKey::list(conn, &query, cursor, (page_size + 1) as i64)?;
            let count = TenantApiKey::count(conn, &query)?;
            let tenant_api_key_ids = keys.iter().map(|x| &x.id).collect();
            let id_to_last_used = TenantApiKeyAccessLog::get(conn, tenant_api_key_ids)?;
            Ok((keys, id_to_last_used, count))
        })
        .await??;

    let cursor = pagination.cursor_item(&state, &keys).map(|x| x.created_at);
    let keys = keys
        .into_iter()
        .take(page_size)
        .map(|x| {
            let last_used = id_to_last_used.get(&x.id).copied();
            (x, None, last_used)
        })
        .map(api_wire_types::SecretApiKey::from_db)
        .collect::<Vec<api_wire_types::SecretApiKey>>();
    Ok(Json(CursorPaginatedResponse::ok(keys, cursor, Some(count))))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateApiKeyRequest {
    name: String,
}

#[api_v2_operation(
    description = "Generates a new secret tenant api key.",
    tags(Organization, Preview)
)]
#[actix::post("/org/api_keys")]
pub async fn post(
    state: web::Data<State>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    request: web::Json<CreateApiKeyRequest>,
) -> JsonApiResponse<api_wire_types::SecretApiKey> {
    let auth = auth.check_guard(TenantGuard::ApiKeys)?;
    let is_live = auth.is_live()?;
    let secret_key = SecretApiKey::generate(is_live);
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let sh_key = secret_key.fingerprint(state.as_ref()).await?;
    let e_key = secret_key.seal_to(&tenant.public_key)?;
    let new_key = state
        .db_pool
        .db_query(move |conn| {
            TenantApiKey::create(conn, request.into_inner().name, sh_key, e_key, tenant_id, is_live)
        })
        .await??;

    Ok(Json(ResponseData::ok(api_wire_types::SecretApiKey::from_db((
        new_key,
        Some(secret_key),
        None,
    )))))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateApiKeyPath {
    id: TenantApiKeyId,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateApiKeyRequest {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
}

#[api_v2_operation(
    description = "Generates a new secret tenant api key.",
    tags(Organization, Preview)
)]
#[patch("/org/api_keys/{id}")]
pub async fn patch(
    state: web::Data<State>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    path: web::Path<UpdateApiKeyPath>,
    request: web::Json<UpdateApiKeyRequest>,
) -> JsonApiResponse<api_wire_types::SecretApiKey> {
    let auth = auth.check_guard(TenantGuard::ApiKeys)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let UpdateApiKeyPath { id } = path.into_inner();
    let UpdateApiKeyRequest { name, status } = request.into_inner();
    let result = state
        .db_pool
        .db_transaction(move |conn| TenantApiKey::update(conn, id, tenant_id, is_live, name, status))
        .await?;

    Ok(Json(ResponseData::ok(api_wire_types::SecretApiKey::from_db((
        result, None, None,
    )))))
}

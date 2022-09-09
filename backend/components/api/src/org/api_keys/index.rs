use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOs;
use crate::auth::{Either, IsLive};
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::secret_api_key::TenantApiKeyResponse;
use crate::types::EmptyRequest;
use crate::types::PaginatedRequest;
use crate::types::{ApiPaginatedResponseData, ApiResponseData};
use crate::State;
use chrono::{DateTime, Utc};
use db::models::tenant_api_key::{ApiKeyListQuery, TenantApiKey};
use db::models::tenant_api_key_access_log::TenantApiKeyAccessLog;
use db::DbError;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::{ApiKeyStatus, TenantApiKeyId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, patch, web, web::Json};

#[api_v2_operation(
    summary = "/org/api_keys",
    operation_id = "org-api_keys",
    description = "Lists the tenant's secret API keys",
    tags(PublicApi)
)]
pub async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<EmptyRequest, DateTime<Utc>>>,
    auth: Either<SessionContext<WorkOs>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiPaginatedResponseData<Vec<TenantApiKeyResponse>, DateTime<Utc>>>, ApiError> {
    let page_size = request.page_size(&state);
    let cursor = request.cursor;

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

    let cursor = request.cursor_item(&state, &keys).map(|x| x.created_at);
    let keys = keys
        .into_iter()
        .take(page_size)
        .map(|x| (id_to_last_used.get(&x.id).copied(), x))
        .map(TenantApiKeyResponse::from)
        .collect::<Vec<TenantApiKeyResponse>>();
    Ok(Json(ApiPaginatedResponseData::ok(keys, cursor, Some(count))))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateApiKeyRequest {
    name: String,
}

#[api_v2_operation(
    summary = "/org/api_keys",
    operation_id = "org-api_keys-post",
    description = "Generates a new secret tenant api key.",
    tags(PublicApi)
)]
pub async fn post(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOs>, SecretTenantAuthContext>,
    request: web::Json<CreateApiKeyRequest>,
) -> actix_web::Result<Json<ApiResponseData<TenantApiKeyResponse>>, ApiError> {
    let is_live = auth.is_live()?;
    let secret_key = SecretApiKey::generate(is_live);
    let tenant = auth.tenant();
    let new_key = TenantApiKey::create(
        &state.db_pool,
        request.into_inner().name,
        secret_key.fingerprint(&state.hmac_client).await?,
        secret_key.seal_to(&tenant.public_key)?,
        tenant.id.clone(),
        is_live,
    )
    .await?;

    Ok(Json(ApiResponseData::ok(TenantApiKeyResponse::from((
        new_key,
        Some(secret_key),
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
    summary = "/org/api_keys/{id}",
    operation_id = "org-api_keys-id",
    description = "Generates a new secret tenant api key.",
    tags(PublicApi)
)]
#[patch("/{id}")]
pub async fn patch(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOs>, SecretTenantAuthContext>,
    path: web::Path<UpdateApiKeyPath>,
    request: web::Json<UpdateApiKeyRequest>,
) -> actix_web::Result<Json<ApiResponseData<TenantApiKeyResponse>>, ApiError> {
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let UpdateApiKeyPath { id } = path.into_inner();
    let UpdateApiKeyRequest { name, status } = request.into_inner();
    let result = state
        .db_pool
        .db_transaction(move |conn| TenantApiKey::update(conn, id, tenant_id, is_live, name, status))
        .await?;

    Ok(Json(ApiResponseData::ok(TenantApiKeyResponse::from(result))))
}

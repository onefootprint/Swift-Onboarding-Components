use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::{Either, IsLive};
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::secret_api_key::TenantApiKeyResponse;
use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::State;
use db::models::tenant_api_keys::TenantApiKey;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::{ApiKeyStatus, TenantApiKeyId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, patch, web, web::Json};

/// List the tenant's secret API keys
#[api_v2_operation(tags(Org))]
pub async fn get(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<Vec<TenantApiKeyResponse>>>, ApiError> {
    let is_live = auth.is_live()?;
    let keys = state
        .db_pool
        .db_query(move |conn| TenantApiKey::list(conn, &auth.tenant_id(), is_live))
        .await??;

    Ok(Json(ApiResponseData::ok(
        keys.into_iter()
            .map(TenantApiKeyResponse::from)
            .collect::<Vec<TenantApiKeyResponse>>(),
    )))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateApiKeyRequest {
    name: String,
}

/// Generate a new secret tenant api key
#[api_v2_operation(tags(Org))]
pub async fn post(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
    request: web::Json<CreateApiKeyRequest>,
) -> actix_web::Result<Json<ApiResponseData<TenantApiKeyResponse>>, ApiError> {
    let secret_key = SecretApiKey::generate(auth.is_live()?);
    let tenant = auth.tenant(&state.db_pool).await?;
    let new_key = TenantApiKey::create(
        &state.db_pool,
        request.into_inner().name,
        secret_key.fingerprint(&state.hmac_client).await?,
        secret_key.seal_to(&tenant.public_key)?,
        tenant.id,
        auth.is_live()?,
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

/// Generate a new secret tenant api key
#[api_v2_operation(tags(Org))]
#[patch("/{id}")]
pub async fn patch(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
    path: web::Path<UpdateApiKeyPath>,
    request: web::Json<UpdateApiKeyRequest>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let is_live = auth.is_live()?;
    let UpdateApiKeyPath { id } = path.into_inner();
    let UpdateApiKeyRequest { name, status } = request.into_inner();
    state
        .db_pool
        .db_query(move |conn| TenantApiKey::update(conn, id, tenant.id, is_live, name, status))
        .await??;

    Ok(Json(ApiResponseData::ok(Empty {})))
}

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::{Either, IsLive};
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::secret_api_key::TenantApiKeyResponse;
use crate::types::success::ApiResponseData;
use crate::State;
use db::models::tenant_api_keys::{NewTenantApiKey, TenantApiKey};
use newtypes::secret_api_key::SecretApiKey;
use paperclip::actix::{api_v2_operation, get, post, web, web::Json};

/// List the tenant's secret API keys
#[api_v2_operation(tags(Org))]
#[get("/api_keys")]
async fn get(
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

/// Generate a new tenant api key
#[api_v2_operation(tags(Org))]
#[post("/api_keys")]
async fn post(
    state: web::Data<State>,
    auth: SessionContext<WorkOsSession>,
) -> actix_web::Result<Json<ApiResponseData<TenantApiKeyResponse>>, ApiError> {
    let secret_key = SecretApiKey::generate(auth.is_live()?);
    let tenant = auth.tenant(&state.db_pool).await?;
    let new_key = NewTenantApiKey {
        sh_secret_api_key: secret_key.fingerprint(&state.hmac_client).await?,
        e_secret_api_key: secret_key.seal_to(&tenant.public_key)?,
        tenant_id: tenant.id,
        is_enabled: true,
        is_live: auth.is_live()?,
    }
    .create(&state.db_pool)
    .await?;

    Ok(Json(ApiResponseData::ok(TenantApiKeyResponse::from((
        new_key,
        Some(secret_key),
    )))))
}

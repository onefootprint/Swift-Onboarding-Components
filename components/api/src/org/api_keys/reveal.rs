use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::{Either, IsLive};
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::secret_api_key::TenantApiKeyResponse;
use crate::types::success::ApiResponseData;
use crate::State;
use db::models::tenant_api_keys::TenantApiKey;
use enclave_proxy::DataTransform;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::TenantApiKeyId;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct RevealRequest {
    /// secret org api key
    id: TenantApiKeyId,
}

/// Decrypt a specific tenant secret API key
#[api_v2_operation(tags(Org))]
#[get("/{id}/reveal")]
async fn get(
    state: web::Data<State>,
    request: web::Path<RevealRequest>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<TenantApiKeyResponse>>, ApiError> {
    // TODO more strict auth for viewing secret keys
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant_id();
    let key = state
        .db_pool
        .db_query(move |conn| TenantApiKey::get(conn, &tenant_id, &request.id, is_live))
        .await??;

    let tenant = auth.tenant(&state.db_pool).await?;
    let decrypted_secret_key = crate::enclave::decrypt_bytes(
        &state,
        &key.e_secret_api_key,
        &tenant.e_private_key,
        DataTransform::Identity,
    )
    .await?;

    Ok(Json(ApiResponseData::ok(TenantApiKeyResponse::from((
        key,
        Some(SecretApiKey::from(decrypted_secret_key.leak().to_string())),
    )))))
}

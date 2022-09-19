use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::{CheckTenantPermissions, Either, WorkOsAuth};
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::types::secret_api_key::TenantApiKeyResponse;
use crate::State;
use db::models::tenant_api_key::TenantApiKey;
use db::models::tenant_api_key_access_log::TenantApiKeyAccessLog;
use enclave_proxy::DataTransform;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::{TenantApiKeyId, TenantPermission};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct RevealRequest {
    /// secret org api key
    id: TenantApiKeyId,
}

#[api_v2_operation(
    summary = "/org/api_keys/{id}/reveal",
    operation_id = "org-api_keys-id-reveal",
    description = "Decrypts a specific tenant secret API key.",
    tags(PublicApi)
)]
#[get("/{id}/reveal")]
async fn get(
    state: web::Data<State>,
    request: web::Path<RevealRequest>,
    auth: Either<WorkOsAuth, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<TenantApiKeyResponse>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::ApiKeys])?;
    // TODO more strict auth for viewing secret keys using a SecretTenantAuthContext
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let (key, last_used_at) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let key = TenantApiKey::get(conn, &tenant_id, &request.id, is_live)?;
            let last_used_at = TenantApiKeyAccessLog::get(conn, vec![&key.id])?
                .get(&key.id)
                .map(|x| x.to_owned());
            Ok((key, last_used_at))
        })
        .await??;

    let tenant = auth.tenant();
    let decrypted_secret_key = state
        .enclave_client
        .decrypt_bytes(
            &key.e_secret_api_key,
            &tenant.e_private_key,
            DataTransform::Identity,
        )
        .await?;

    Ok(Json(ApiResponseData::ok(TenantApiKeyResponse::from((
        key,
        Some(SecretApiKey::from(decrypted_secret_key.leak().to_string())),
        last_used_at,
    )))))
}

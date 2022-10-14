use crate::auth::tenant::{CheckTenantPermissions, SecretTenantAuthContext, WorkOsAuthContext};
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::utils::db2api::DbToApi;
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
    description = "Decrypts a specific tenant secret API key.",
    tags(Organization, PublicApi)
)]
#[get("/org/api_keys/{id}/reveal")]
async fn get(
    state: web::Data<State>,
    request: web::Path<RevealRequest>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<api_wire_types::SecretApiKey> {
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

    Ok(Json(ResponseData::ok(api_wire_types::SecretApiKey::from_db((
        key,
        Some(SecretApiKey::from(decrypted_secret_key.leak().to_string())),
        last_used_at,
    )))))
}

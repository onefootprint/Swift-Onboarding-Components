use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::errors::ApiError;
use api_core::types::ModernApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::tenant_api_key::TenantApiKey;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::TenantApiKeyId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct RevealRequest {
    /// secret org api key
    id: TenantApiKeyId,
}

#[api_v2_operation(
    description = "Decrypts a specific tenant secret API key.",
    tags(ApiKeys, Organization, Private)
)]
#[post("/org/api_keys/{id}/reveal")]
/// Note, we make this a post because it does a decrypt operation. In the future, we may
/// make an access event for it
async fn post(
    state: web::Data<State>,
    request: web::Path<RevealRequest>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::SecretApiKey> {
    let auth = auth.check_guard(TenantGuard::ApiKeys)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let (key, role) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (key, role) = TenantApiKey::get(conn, (&request.id, &tenant_id, is_live))?;
            Ok((key, role))
        })
        .await?;

    let tenant = auth.tenant();
    let decrypted_secret_key = state
        .enclave_client
        .decrypt_to_piistring(&key.e_secret_api_key, &tenant.e_private_key)
        .await?;

    Ok(api_wire_types::SecretApiKey::from_db((
        key,
        role,
        Some(SecretApiKey::from(decrypted_secret_key.leak().to_string())),
    )))
}

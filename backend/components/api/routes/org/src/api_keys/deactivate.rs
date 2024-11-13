use crate::api_keys::decrypt_scrubbed_api_keys;
use api_core::auth::tenant::AuthActor;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::errors::tenant::TenantError;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::headers::InsightHeaders;
use api_core::State;
use api_errors::ServerErr;
use chrono::Utc;
use db::models::tenant_api_key::TenantApiKey;
use newtypes::TenantApiKeyId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Permanently deactivates an existing tenant API key.",
    tags(ApiKeys, Organization, Private)
)]
#[post("/org/api_keys/{id}/deactivate")]
pub async fn post(
    state: web::Data<State>,
    // Don't allow updating an API key with an API key...
    auth: TenantSessionAuth,
    path: web::Path<TenantApiKeyId>,
    _insight: InsightHeaders,
) -> ApiResponse<api_wire_types::DashboardSecretApiKey> {
    let auth = auth.check_guard(TenantGuard::ApiKeys)?;
    let id = path.into_inner();
    if let AuthActor::TenantApiKey(key_id) = auth.actor() {
        if key_id == id {
            return Err(TenantError::CannotEditCurrentApiKey.into());
        }
    }
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (api_key, role) = state
        .db_transaction(move |conn| {
            TenantApiKey::update(conn, id, tenant_id, is_live, None, None, None, Some(Utc::now()))
        })
        .await?;

    let scrubbed_key = decrypt_scrubbed_api_keys(&state, auth.tenant(), vec![&api_key]).await?;
    let (_, scrubbed_key) = scrubbed_key
        .into_iter()
        .next()
        .ok_or(ServerErr("No scrubbed key"))?;
    Ok(api_wire_types::DashboardSecretApiKey::from_db((
        api_key,
        role,
        scrubbed_key,
        None,
    )))
}

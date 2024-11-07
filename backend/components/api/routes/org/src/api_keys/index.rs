use crate::api_keys::decrypt_scrubbed_api_keys;
use api_core::auth::tenant::AuthActor;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::errors::tenant::TenantError;
use api_core::errors::AssertionError;
use api_core::types::ApiResponse;
use api_core::types::OffsetPaginatedResponse;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use api_wire_types::ApiKeyFilters;
use db::models::tenant_api_key::ApiKeyListFilters;
use db::models::tenant_api_key::TenantApiKey;
use db::models::tenant_role::TenantRole;
use db::DbError;
use itertools::Itertools;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::ApiKeyStatus;
use newtypes::TenantApiKeyId;
use newtypes::TenantRoleId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::patch;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};

type ApiKeysResponse = Json<OffsetPaginatedResponse<api_wire_types::DashboardSecretApiKey>>;

#[api_v2_operation(
    description = "Lists the tenant's secret API keys",
    tags(ApiKeys, Organization, Private)
)]
#[actix::get("/org/api_keys")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<ApiKeyFilters>,
    pagination: web::Query<OffsetPaginationRequest>,
    auth: TenantSessionAuth,
) -> ApiResponse<ApiKeysResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
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
    let pagination = pagination.db_pagination(&state);
    let (keys_and_roles, next_page, count) = state
        .db_query(move |conn| -> Result<_, DbError> {
            let (keys_and_roles, next_page) = TenantApiKey::list(conn, &query, pagination)?;
            let count = TenantApiKey::count(conn, &query)?;
            Ok((keys_and_roles, next_page, count))
        })
        .await?;

    let keys = keys_and_roles.iter().map(|(k, _)| k).collect_vec();
    let mut scrubbed_keys = decrypt_scrubbed_api_keys(&state, auth.tenant(), keys).await?;

    let results = keys_and_roles
        .into_iter()
        .map(|(key, role)| {
            let scrubbed_key = scrubbed_keys
                .remove(&key.id)
                .ok_or(AssertionError("Missing scrubbed key"))?;
            Ok((key, role, scrubbed_key, None))
        })
        .map_ok(api_wire_types::DashboardSecretApiKey::from_db)
        .collect::<FpResult<Vec<api_wire_types::DashboardSecretApiKey>>>()?;
    Ok(Json(OffsetPaginatedResponse::ok(results, next_page, count)))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateApiKeyRequest {
    name: String,
    role_id: TenantRoleId,
}

#[api_v2_operation(
    description = "Generates a new secret tenant api key.",
    tags(ApiKeys, Organization, Private)
)]
#[actix::post("/org/api_keys")]
pub async fn post(
    state: web::Data<State>,
    // Don't allow updating an API key with an API key...
    auth: TenantSessionAuth,
    request: web::Json<CreateApiKeyRequest>,
) -> ApiResponse<api_wire_types::DashboardSecretApiKey> {
    let auth = auth.check_guard(TenantGuard::ApiKeys)?;
    let is_live = auth.is_live()?;
    let secret_key = SecretApiKey::generate(is_live);
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();
    let sh_key = secret_key.fingerprint(state.as_ref()).await?;
    let e_key = secret_key.seal_to(&tenant.public_key)?;
    let CreateApiKeyRequest { name, role_id } = request.into_inner();
    let (api_key, role) = state
        .db_transaction(move |conn| -> FpResult<_> {
            let api_key = TenantApiKey::create(conn, name, sh_key, e_key, tenant_id, is_live, role_id)?;
            let role = TenantRole::get(conn, &api_key.role_id)?;
            Ok((api_key, role))
        })
        .await?;

    Ok(api_wire_types::DashboardSecretApiKey::from_db((
        api_key,
        role,
        secret_key.scrub(),
        Some(secret_key),
    )))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateApiKeyRequest {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
    role_id: Option<TenantRoleId>,
}

#[api_v2_operation(
    description = "Updates an existing secret tenant api key.",
    tags(ApiKeys, Organization, Private)
)]
#[patch("/org/api_keys/{id}")]
pub async fn patch(
    state: web::Data<State>,
    // Don't allow updating an API key with an API key...
    auth: TenantSessionAuth,
    path: web::Path<TenantApiKeyId>,
    request: web::Json<UpdateApiKeyRequest>,
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
    let UpdateApiKeyRequest {
        name,
        status,
        role_id,
    } = request.into_inner();
    let (api_key, role) = state
        .db_transaction(move |conn| {
            TenantApiKey::update(conn, id, tenant_id, is_live, name, status, role_id, None)
        })
        .await?;
    let scrubbed_key = decrypt_scrubbed_api_keys(&state, auth.tenant(), vec![&api_key]).await?;
    let (_, scrubbed_key) = scrubbed_key
        .into_iter()
        .next()
        .ok_or(AssertionError("No scrubbed key"))?;

    Ok(api_wire_types::DashboardSecretApiKey::from_db((
        api_key,
        role,
        scrubbed_key,
        None,
    )))
}

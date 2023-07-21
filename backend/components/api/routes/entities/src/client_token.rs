use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::tenant::ClientTenantAuth;
use api_core::auth::tenant::AuthActor;
use api_core::auth::tenant::ClientTenantScope;
use api_core::errors::tenant::TenantError;
use api_core::errors::ApiResult;
use api_core::errors::AssertionError;
use api_core::utils::session::AuthSession;
use api_wire_types::ClientTokenRequest;
use api_wire_types::ClientTokenResponse;
use api_wire_types::ClientTokenScopeKind;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use macros::route_alias;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, post, web};

#[route_alias(post(
    "/users/{fp_id}/client_token",
    tags(Client, PublicApi),
    description = "Create a short-lived token safe to pass to your client for operations to vault or decrypt data for this user.",
))]
#[api_v2_operation(
    description = "Create a short-lived token safe to pass to your client for operations to vault or decrypt data for this user.",
    tags(Entities, Private)
)]
#[post("/entities/{fp_id}/client_token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    request: web::Json<ClientTokenRequest>,
    // For now, only accept tenant API key
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<ClientTokenResponse> {
    // Safeguard so when API keys have less than admin permissions we don't allow making tokens
    let auth = auth.check_guard(TenantGuard::Admin)?;
    let tenant_api_key_id = match auth.actor() {
        AuthActor::TenantApiKey(id) => id,
        _ => return Err(AssertionError("Non-api key actor in client_token").into()),
    };
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let ClientTokenRequest { fields, ttl, scopes, decrypt_reason } = request.into_inner();
    let session_key = state.session_sealing_key.clone();

    if scopes.is_empty() {
        return Err(TenantError::MustProvideScope.into());
    }
    let fields = fields.into_iter().collect_vec();
    let scopes = scopes
        .into_iter()
        .map(|s| match s {
            ClientTokenScopeKind::Decrypt => ClientTenantScope::Decrypt(fields.clone()),
            ClientTokenScopeKind::Vault => ClientTenantScope::Vault(fields.clone()),
        })
        .collect();

    let ttl = ttl.unwrap_or(30 * 60);
    #[allow(clippy::manual_range_contains)]
    if ttl < 60 || ttl > (24 * 60 * 60) {
        return Err(TenantError::InvalidExpiry.into());
    }

    let (token, session) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // We'll check this later too, but worth at least doing a sanity check that the user
            // in question exists
            ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let data = ClientTenantAuth {
                fp_id,
                is_live,
                tenant_id,
                scopes,
                tenant_api_key_id,
                decrypt_reason,
            };
            let duration = Duration::seconds(ttl.into());
            let (auth_token, session) = AuthSession::create_sync(conn, &session_key, data.into(), duration)?;
            Ok((auth_token, session))
        })
        .await??;

    let expires_at = session.expires_at;
    ResponseData::ok(ClientTokenResponse { token, expires_at }).json()
}

use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::tenant::ClientTenantAuth;
use api_core::auth::tenant::AuthActor;
use api_core::auth::tenant::ClientTenantScope;
use api_core::auth::CanDecrypt;
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
    let ClientTokenRequest {
        fields,
        ttl,
        scopes,
        decrypt_reason,
    } = request.into_inner();
    let fields = fields.into_iter().collect_vec();
    if fields.is_empty() {
        return Err(TenantError::MustProvideFields.into());
    }
    if scopes.is_empty() {
        return Err(TenantError::MustProvideScope.into());
    }
    // Check that the authed principal has a superset of the permissions that will be granted to
    // this token
    for s in scopes.iter() {
        match s {
            ClientTokenScopeKind::Decrypt | ClientTokenScopeKind::DecryptDownload => {
                auth.check_one_guard(CanDecrypt::new(fields.clone()))?
            }
            ClientTokenScopeKind::Vault => auth.check_one_guard(TenantGuard::WriteEntities)?,
        }
    }
    // Can use Any guard here since we've already checked permissions above
    let auth = auth.check_guard(api_core::auth::Any)?;
    let tenant_api_key_id = match auth.actor() {
        AuthActor::TenantApiKey(id) => id,
        _ => return Err(AssertionError("Non-api key actor in client_token").into()),
    };
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();

    let scopes: Vec<_> = scopes
        .into_iter()
        .map(|s| -> ApiResult<_> {
            let result = match s {
                ClientTokenScopeKind::Decrypt => ClientTenantScope::Decrypt(fields.clone()),
                ClientTokenScopeKind::Vault => ClientTenantScope::Vault(fields.clone()),
                ClientTokenScopeKind::DecryptDownload => {
                    // DecryptDownload scopes have a few other requirements
                    if fields.len() > 1 {
                        return Err(TenantError::OneDecryptDownloadField.into());
                    }
                    if decrypt_reason.is_none() {
                        return Err(TenantError::NoDecryptionReasonProvided.into());
                    }
                    match ttl {
                        Some(ttl) if ttl > 60 * 5 => {
                            return Err(TenantError::InvalidDecryptDownloadExpiry.into());
                        }
                        _ => (),
                    }
                    let field = fields.first().ok_or(TenantError::OneDecryptDownloadField)?;
                    ClientTenantScope::DecryptDownload(field.clone())
                }
            };
            Ok(result)
        })
        .collect::<ApiResult<_>>()?;

    let has_decrypt_download_scope = scopes
        .iter()
        .any(|s| matches!(s, ClientTenantScope::DecryptDownload(_)));
    let default_ttl = match has_decrypt_download_scope {
        true => 5 * 60,
        false => 30 * 60,
    };
    let ttl = ttl.unwrap_or(default_ttl);
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

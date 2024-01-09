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
use api_core::errors::ValidationError;
use api_core::telemetry::RootSpan;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::session::AuthSession;
use api_wire_types::CreateClientTokenRequest;
use api_wire_types::CreateClientTokenResponse;
use api_wire_types::DEPRECATEDClientTokenScopeKind;
use api_wire_types::ModernClientTokenScopeKind;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use macros::route_alias;
use paperclip::actix::{api_v2_operation, post, web};

#[route_alias(post(
    "/users/{fp_id}/client_token",
    tags(Users, Client, PublicApi),
    description = "Create a short-lived token safe to pass to your client for operations to vault or decrypt data for this user.",
))]
#[api_v2_operation(
    description = "Create a short-lived token safe to pass to your client for operations to vault or decrypt data for this user.",
    tags(Entities, Client, Private)
)]
#[post("/entities/{fp_id}/client_token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: web::Json<CreateClientTokenRequest>,
    // For now, only accept tenant API key
    auth: SecretTenantAuthContext,
    root_span: RootSpan,
) -> JsonApiResponse<CreateClientTokenResponse> {
    let CreateClientTokenRequest {
        fields,
        ttl,
        scopes,
        scope,
        decrypt_reason,
    } = request.into_inner();
    if !scopes.is_empty() {
        root_span.record("meta", "has_old_scopes");
    } else {
        root_span.record("meta", "has_modern_scope");
    }
    // `scopes` is an old, deprecated representation. Keep this logic to parse `scopes` until old
    // clients have updated
    let scopes = match (scope, scopes) {
        (Some(scope), _) => match scope {
            ModernClientTokenScopeKind::Vault => vec![DEPRECATEDClientTokenScopeKind::Vault],
            ModernClientTokenScopeKind::Decrypt => vec![DEPRECATEDClientTokenScopeKind::Decrypt],
            ModernClientTokenScopeKind::VaultAndDecrypt => {
                vec![
                    DEPRECATEDClientTokenScopeKind::Vault,
                    DEPRECATEDClientTokenScopeKind::Decrypt,
                ]
            }
            ModernClientTokenScopeKind::DecryptDownload => {
                vec![DEPRECATEDClientTokenScopeKind::DecryptDownload]
            }
        },
        (None, v) if v.is_empty() => {
            return ValidationError("Missing required field scope").into();
        }
        (None, v) => v,
    };
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
            DEPRECATEDClientTokenScopeKind::Decrypt | DEPRECATEDClientTokenScopeKind::DecryptDownload => {
                auth.check_one_guard(CanDecrypt::new(fields.clone()))?
            }
            DEPRECATEDClientTokenScopeKind::Vault => auth.check_one_guard(TenantGuard::WriteEntities)?,
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
                DEPRECATEDClientTokenScopeKind::Decrypt => ClientTenantScope::Decrypt(fields.clone()),
                DEPRECATEDClientTokenScopeKind::Vault => ClientTenantScope::Vault(fields.clone()),
                DEPRECATEDClientTokenScopeKind::DecryptDownload => {
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
    let max_ttl = if auth.tenant().id.is_integration_test_tenant() {
        // Allow our testing tenants to create longer-lived tokens
        30 * 24 * 60 * 90 // 30d
    } else {
        24 * 60 * 60 // 1d
    };
    let ttl = ttl.unwrap_or(default_ttl);
    #[allow(clippy::manual_range_contains)]
    if ttl < 60 || ttl > max_ttl {
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
    ResponseData::ok(CreateClientTokenResponse { token, expires_at }).json()
}

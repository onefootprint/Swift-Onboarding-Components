use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::types::ApiResponse;
use crate::State;
use api_core::auth::session::tenant::ClientTenantAuth;
use api_core::auth::tenant::AuthActor;
use api_core::auth::tenant::ClientTenantScope;
use api_core::auth::tenant::TenantApiKey;
use api_core::auth::CanDecrypt;
use api_core::errors::tenant::TenantError;
use api_core::errors::AssertionError;
use api_core::errors::ValidationError;
use api_core::telemetry::RootSpan;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_wire_types::CreateClientTokenRequest;
use api_wire_types::CreateClientTokenResponse;
use api_wire_types::DEPRECATEDClientTokenScopeKind;
use api_wire_types::ModernClientTokenScopeKind;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::AliasId;
use newtypes::CardDataKind;
use newtypes::CardInfo;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use strum::IntoEnumIterator;

#[api_v2_operation(
    description = "Create a short-lived token safe to pass to your client for operations to vault or decrypt data for this user. This API is often used in combination with the [Footprint Form SDK](https://docs.onefootprint.com/embedded-components/getting-started).",
    tags(Users, PublicApi)
)]
#[post("/users/{fp_id}/client_token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: web::Json<CreateClientTokenRequest>,
    auth: TenantApiKey,
    root_span: RootSpan,
) -> ApiResponse<CreateClientTokenResponse> {
    let CreateClientTokenRequest {
        fields,
        ttl,
        scopes,
        scope,
        decrypt_reason,
    } = request.into_inner();
    let fields = if scope
        .as_ref()
        .is_some_and(|s| *s == ModernClientTokenScopeKind::VaultCard)
    {
        // For VaultCard scope, generate a random card alias to use.
        // This token will have permissions to write to all non-derived CDKs with this alias
        let alias = AliasId::random();
        CardDataKind::iter()
            .filter(|cdk| !cdk.is_derived())
            .map(|kind| {
                CardInfo {
                    alias: alias.clone(),
                    kind,
                }
                .into()
            })
            .collect_vec()
    } else {
        fields.into_iter().collect_vec()
    };

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
            ModernClientTokenScopeKind::VaultCard => vec![DEPRECATEDClientTokenScopeKind::Vault],
        },
        (None, v) if v.is_empty() => {
            return ValidationError("Missing required field scope").into();
        }
        (None, v) => v,
    };
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
        .map(|s| -> FpResult<_> {
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
        .collect::<FpResult<_>>()?;

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
        .db_query(move |conn| -> FpResult<_> {
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
            let (auth_token, session) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            Ok((auth_token, session))
        })
        .await?;

    let expires_at = session.expires_at;
    Ok(CreateClientTokenResponse {
        token,
        expires_at,
        fields,
    })
}

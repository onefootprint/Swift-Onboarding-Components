use super::AuthActor;
use super::CanCheckTenantGuard;
use crate::auth::tenant::TenantAuth;
use crate::auth::AuthError;
use crate::errors::ApiResult;
use crate::errors::AssertionError;
use crate::State;
use actix_web::http::header::Header;
use actix_web::web;
use actix_web::FromRequest;
use actix_web_httpauth::headers::authorization::Authorization;
use actix_web_httpauth::headers::authorization::Basic;
use db::models::tenant::Tenant;
use db::models::tenant_api_key::TenantApiKey;
use db::models::tenant_role::TenantRole;
use db::DbError;
use futures_util::Future;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::DataLifetimeSource;
use newtypes::PreviewApi;
use newtypes::TenantScope;
use paperclip::actix::Apiv2Security;
use std::pin::Pin;
use tracing_actix_web::RootSpan;

#[derive(Debug, Clone)]
pub struct CheckedSecretTenantAuth {
    tenant: Tenant,
    api_key: TenantApiKey,
    role: TenantRole,
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Secret API Key",
    in = "header",
    name = "X-Footprint-Secret-Key",
    description = "Secret API key. You can create and view your API keys in the dashboard. This key should never be sent to your client and should be treated as a secret on your server."
)]
/// SecretTenantAuthContext extracts a tenant's public key from the X-Footprint-Secret-Key header
/// which authenticates the client as a tenant.
pub struct SecretTenantAuthContext(CheckedSecretTenantAuth);

pub const HEADER_NAME: &str = "X-Footprint-Secret-Key";

impl FromRequest for SecretTenantAuthContext {
    type Error = crate::ModernApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        // get the tenant header
        let tenant_sk_input = parse_auth_key(req);

        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        let root_span = RootSpan::from_request(req, payload);

        Box::pin(async move {
            let root_span = root_span
                .await
                .map_err(|_| AssertionError("Cannot extract root span"))?;

            let sk = tenant_sk_input?;
            let sh_api_key = sk.fingerprint(state.as_ref()).await?;

            let (api_key, tenant, role) = state
                .db_pool
                .db_transaction(|conn| TenantApiKey::get_enabled(conn, sh_api_key))
                .await
                .map_err(|e| -> Self::Error {
                    match e {
                        DbError::DataNotFound => {
                            if sk.is_maybe_ob_config_key() {
                                AuthError::ObConfigKeyUsedForApiKey.into()
                            } else {
                                AuthError::ApiKeyNotFound.into()
                            }
                        }
                        _ => e.into(),
                    }
                })?;

            tracing::info!(tenant_id=%tenant.id, api_key_id=%api_key.id, role_id=%role.id, "authenticated");

            root_span.record("tenant_id", &tenant.id.to_string());
            root_span.record("is_live", api_key.is_live);
            root_span.record("auth_method", "secret_key");

            Ok(SecretTenantAuthContext(CheckedSecretTenantAuth {
                tenant,
                api_key,
                role,
            }))
        })
    }
}

/// Supports either HTTP basic auth (key as the user id) or our auth header
fn parse_auth_key(req: &actix_web::HttpRequest) -> ApiResult<SecretApiKey> {
    if let Ok(auth) = Authorization::<Basic>::parse(req) {
        let auth = auth.into_scheme();
        return Ok(SecretApiKey::from(auth.user_id().to_string()));
    }

    let tenant_sk_input = req
        .headers()
        .get(HEADER_NAME)
        .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
        .map(SecretApiKey::from)
        .ok_or_else(|| AuthError::MissingHeader(HEADER_NAME.to_owned()))?;

    Ok(tenant_sk_input)
}

impl SecretTenantAuthContext {
    pub fn can_access_preview(&self, api: &PreviewApi) -> bool {
        let tenant = &self.0.tenant;
        tenant.is_demo_tenant || tenant.allowed_preview_apis.contains(api)
    }

    pub fn check_preview_guard(&self, api: PreviewApi) -> ApiResult<()> {
        if !self.can_access_preview(&api) {
            tracing::error!(tenant_id=%self.0.tenant.id, tenant_name=%self.0.tenant.name, api=%api, "Tenant attempting to use unallowed preview API");
            return Err(AuthError::CannotAccessPreviewApi.into());
        }
        Ok(())
    }
}

impl TenantAuth for CheckedSecretTenantAuth {
    fn tenant(&self) -> &Tenant {
        &self.tenant
    }

    fn is_live(&self) -> ApiResult<bool> {
        if self.tenant.sandbox_restricted && self.api_key.is_live {
            return Err(AuthError::SandboxRestricted.into());
        }

        Ok(self.api_key.is_live)
    }

    fn actor(&self) -> AuthActor {
        AuthActor::TenantApiKey(self.api_key.id.clone())
    }

    fn scopes(&self) -> Vec<TenantScope> {
        self.role.scopes.clone()
    }

    fn dl_source(&self) -> DataLifetimeSource {
        DataLifetimeSource::Tenant
    }
}

impl CanCheckTenantGuard for SecretTenantAuthContext {
    type Auth = Box<dyn TenantAuth>;

    fn token_scopes(&self) -> Vec<TenantScope> {
        self.0.role.scopes.clone()
    }

    fn auth(self) -> Box<dyn TenantAuth> {
        Box::new(self.0)
    }
}

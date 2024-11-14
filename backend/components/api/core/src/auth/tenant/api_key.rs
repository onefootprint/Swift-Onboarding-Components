use super::AuthActor;
use super::BasicTenantAuth;
use super::CanCheckTenantGuard;
use crate::auth::tenant::TenantAuth;
use crate::auth::AuthError;
use crate::FpResult;
use crate::State;
use actix_web::http::header::Header;
use actix_web::web;
use actix_web::FromRequest;
use actix_web_httpauth::headers::authorization::Authorization;
use actix_web_httpauth::headers::authorization::Basic;
use api_errors::FpDbOptionalExtension;
use api_errors::ServerErr;
use db::models::tenant::Tenant;
use db::models::tenant_api_key::TenantApiKey as DbTenantApiKey;
use db::models::tenant_role::TenantRole;
use futures_util::Future;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::TenantScope;
use paperclip::actix::Apiv2Security;
use std::pin::Pin;
use tracing::Instrument;
use tracing_actix_web::RootSpan;

#[derive(Debug, Clone)]
pub struct CheckedTenantApiKey {
    tenant: Tenant,
    api_key: DbTenantApiKey,
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
pub struct TenantApiKey(pub(super) CheckedTenantApiKey);

pub const HEADER_NAME: &str = "X-Footprint-Secret-Key";

impl FromRequest for TenantApiKey {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    #[tracing::instrument("SecretTenantAuthContext::from_request", skip_all)]
    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        // get the tenant header
        let tenant_sk_input = parse_auth_key(req);

        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        let root_span = RootSpan::from_request(req, payload);

        let extractor = async move {
            let root_span = root_span
                .await
                .map_err(|_| ServerErr("Cannot extract root span"))?;

            let sk = tenant_sk_input?;
            let sh_api_key = sk.fingerprint(state.as_ref()).await?;

            let result = state
                .db_transaction(move |conn| DbTenantApiKey::get_enabled(conn, sh_api_key))
                .await;
            let (api_key, tenant, role) = match result.optional() {
                Ok(Some((api_key, tenant, role))) => (api_key, tenant, role),
                Ok(None) => {
                    if sk.is_maybe_ob_config_key() {
                        return Err(AuthError::ObConfigKeyUsedForApiKey.into());
                    } else {
                        return Err(AuthError::ApiKeyNotFound.into());
                    }
                }
                Err(e) => return Err(e.into()),
            };

            tracing::info!(tenant_id=%tenant.id, api_key_id=%api_key.id, role_id=%role.id, "authenticated");

            root_span.record("tenant_id", &tenant.id.to_string());
            root_span.record("is_live", api_key.is_live);
            root_span.record("auth_method", "secret_key");

            Ok(TenantApiKey(CheckedTenantApiKey {
                tenant,
                api_key,
                role,
            }))
        };
        Box::pin(extractor.in_current_span())
    }
}

/// Supports either HTTP basic auth (key as the user id) or our auth header
fn parse_auth_key(req: &actix_web::HttpRequest) -> FpResult<SecretApiKey> {
    if let Ok(auth) = Authorization::<Basic>::parse(req) {
        let auth = auth.into_scheme();
        return Ok(SecretApiKey::from(auth.user_id().to_string()));
    }

    let tenant_sk_input = req
        .headers()
        .get(HEADER_NAME)
        .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
        .map(SecretApiKey::from)
        .ok_or_else(|| AuthError::MissingHeader(vec![HEADER_NAME.to_owned()]))?;

    Ok(tenant_sk_input)
}

impl BasicTenantAuth for CheckedTenantApiKey {
    fn tenant(&self) -> &Tenant {
        &self.tenant
    }

    fn is_live(&self) -> FpResult<bool> {
        if self.tenant.sandbox_restricted && self.api_key.is_live {
            return Err(AuthError::SandboxRestricted.into());
        }

        Ok(self.api_key.is_live)
    }

    fn actor(&self) -> AuthActor {
        AuthActor::TenantApiKey(self.api_key.id.clone())
    }
}

impl TenantAuth for CheckedTenantApiKey {
    fn scopes(&self) -> Vec<TenantScope> {
        self.role.scopes.clone()
    }

    fn is_firm_employee(&self) -> bool {
        false
    }
}

impl CanCheckTenantGuard for TenantApiKey {
    type Auth = Box<dyn TenantAuth>;

    fn raw_token_scopes(&self) -> Vec<TenantScope> {
        self.0.role.scopes.clone()
    }

    fn auth(self) -> Box<dyn TenantAuth> {
        Box::new(self.0)
    }

    fn purpose(&self) -> Option<newtypes::TenantSessionPurpose> {
        None
    }
}

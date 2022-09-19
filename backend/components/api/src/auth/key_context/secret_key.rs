use crate::auth::{AuthError, CheckTenantPermissions, TenantAuth};
use crate::{errors::ApiError, State};
use actix_web::http::header::Header;
use actix_web::{web, FromRequest};
use actix_web_httpauth::headers::authorization::{Authorization, Basic};
use db::models::tenant::Tenant;
use db::models::tenant_api_key::TenantApiKey;
use futures_util::Future;

use newtypes::secret_api_key::SecretApiKey;
use paperclip::actix::Apiv2Security;
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Footprint-Secret-Key",
    description = "The client's secret key"
)]
/// SecretTenantAuthContext extracts a tenant's public key from the X-Footprint-Secret-Key header
/// which authenticates the client as a tenant.
pub struct SecretTenantAuthContext {
    tenant: Tenant,
    api_key: TenantApiKey,
}

impl SecretTenantAuthContext {
    /// get the tenant's api key id
    pub fn api_key(&self) -> &TenantApiKey {
        &self.api_key
    }
}

pub const HEADER_NAME: &str = "X-Footprint-Secret-Key";

impl FromRequest for SecretTenantAuthContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        // get the tenant header
        let tenant_sk_input = parse_auth_key(req);

        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        Box::pin(async move {
            let sh_api_key = tenant_sk_input?.fingerprint(&state.hmac_client).await?;

            let (api_key, tenant) = state
                .db_pool
                .db_query(|conn| TenantApiKey::get_enabled(conn, sh_api_key))
                .await??
                .ok_or(AuthError::ApiKeyNotFound)?;
            Ok(SecretTenantAuthContext { tenant, api_key })
        })
    }
}

/// Supports either HTTP basic auth (key as the user id) or our auth header
fn parse_auth_key(req: &actix_web::HttpRequest) -> Result<SecretApiKey, ApiError> {
    if let Ok(auth) = Authorization::<Basic>::parse(req) {
        let auth = auth.into_scheme();
        return Ok(SecretApiKey::from(auth.user_id().to_string()));
    }

    let tenant_sk_input = req
        .headers()
        .get(HEADER_NAME)
        .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
        .map(SecretApiKey::from)
        .ok_or(AuthError::MissingSecretKeyAuth)?;

    Ok(tenant_sk_input)
}

impl TenantAuth for SecretTenantAuthContext {
    fn tenant(&self) -> &Tenant {
        &self.tenant
    }

    fn format_principal(&self) -> String {
        format!("ApiKey<{}>", self.api_key.name)
    }

    fn is_live(&self) -> Result<bool, ApiError> {
        if self.tenant.sandbox_restricted && self.api_key.is_live {
            return Err(AuthError::SandboxRestricted.into());
        }

        Ok(self.api_key.is_live)
    }
}

impl CheckTenantPermissions for SecretTenantAuthContext {
    fn check_permissions(
        self,
        _permissions: Vec<newtypes::TenantPermission>,
    ) -> Result<Box<dyn TenantAuth>, AuthError> {
        Ok(Box::new(self))
    }
}

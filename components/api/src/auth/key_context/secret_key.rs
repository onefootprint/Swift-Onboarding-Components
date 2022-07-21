use crate::auth::session_context::HasTenant;
use crate::auth::uv_permission::{HasVaultPermission, VaultPermission};
use crate::auth::{AuthError, IsLive};
use crate::{errors::ApiError, State};
use actix_web::{web, FromRequest};
use async_trait::async_trait;
use db::models::tenant_api_keys::TenantApiKey;
use db::models::tenants::Tenant;
use db::DbPool;
use futures_util::Future;

use newtypes::secret_api_key::SecretApiKey;
use newtypes::TenantId;
use paperclip::actix::Apiv2Security;
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Client-Secret-Key",
    description = "The client's secret key"
)]
/// SecretTenantAuthContext extracts a tenant's public key from the X-Client-Secret-Key header
/// which authenticates the client as a tenant.
pub struct SecretTenantAuthContext {
    tenant: Tenant,
    api_key: TenantApiKey,
}

impl SecretTenantAuthContext {
    // get tenant secret key for context
    pub fn tenant(&self) -> &Tenant {
        &self.tenant
    }
}

pub const HEADER_NAME: &str = "X-Client-Secret-Key";

impl FromRequest for SecretTenantAuthContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let static_req = req.clone();
        Box::pin(async move { from_request_inner(&static_req).await })
    }
}

pub async fn from_request_inner(req: &actix_web::HttpRequest) -> Result<SecretTenantAuthContext, ApiError> {
    // get the tenant header
    let tenant_sk_input = req
        .headers()
        .get(HEADER_NAME)
        .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
        .map(SecretApiKey::from)
        .ok_or(AuthError::MissingClientSecretAuthHeader)?;

    let state = req.app_data::<web::Data<State>>().unwrap();
    let sh_api_key = tenant_sk_input.fingerprint(&state.hmac_client).await?;

    let (tenant, api_key) = db::tenant::secret_auth(&state.db_pool, sh_api_key)
        .await?
        .ok_or(AuthError::UnknownClient)?;
    Ok(SecretTenantAuthContext { tenant, api_key })
}

impl HasVaultPermission for SecretTenantAuthContext {
    fn has_permission(&self, permission: VaultPermission) -> bool {
        matches!(permission, VaultPermission::Decrypt(_))
    }
}

#[async_trait]
impl HasTenant for SecretTenantAuthContext {
    fn tenant_id(&self) -> TenantId {
        self.tenant().id.clone()
    }

    async fn tenant(&self, _pool: &DbPool) -> Result<Tenant, ApiError> {
        Ok(self.tenant().clone())
    }
}

impl IsLive for SecretTenantAuthContext {
    fn is_live(&self) -> bool {
        self.api_key.is_live
    }
}

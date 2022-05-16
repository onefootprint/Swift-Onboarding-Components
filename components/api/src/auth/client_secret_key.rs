use std::pin::Pin;

use actix_web::{web, FromRequest};
use db::models::tenants::Tenant;
use futures_util::Future;
use paperclip::actix::Apiv2Security;

use crate::State;

use super::AuthError;

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
}

impl SecretTenantAuthContext {
    // get tenant secret key for context
    pub fn tenant(&self) -> &Tenant {
        &self.tenant
    }
}

const HEADER_NAME: &str = "X-Client-Secret-Key";

impl FromRequest for SecretTenantAuthContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        // get the tenant header
        let tenant_pk = req
            .headers()
            .get(HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or(AuthError::MissingClientSecretAuthHeader);

        let state = req.app_data::<web::Data<State>>().unwrap();
        let pool = state.db_pool.clone();
        let hmac_client = state.hmac_client.clone();

        Box::pin(async move {
            let sh_api_key = hmac_client.signed_hash(tenant_pk?.as_bytes()).await?;

            let tenant = db::tenant::secret_auth(&pool, sh_api_key)
                .await?
                .ok_or(AuthError::UnknownClient)?;
            Ok(Self { tenant })
        })
    }
}

use std::{marker::PhantomData, pin::Pin};

use actix_web::{web, FromRequest};
use db::models::{ob_configurations::ObConfiguration, tenants::Tenant};
use futures_util::Future;
use paperclip::actix::Apiv2Security;

use crate::{auth::AuthError, State};

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Client-Public-Key",
    description = "The client's publishable key"
)]
/// SecretTenantAuthContext extracts a tenant's public key from the X-Client-Public-Key header
/// which authenticates the client as a tenant.
pub struct PublicTenantAuthContext {
    pub tenant: Tenant,
    pub ob_config: ObConfiguration,
    phantom: PhantomData<()>,
}

const HEADER_NAME: &str = "X-Client-Public-Key";

impl FromRequest for PublicTenantAuthContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        // get the tenant header
        let config_key = req
            .headers()
            .get(HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or(AuthError::MissingClientPublicAuthHeader);

        let pool = req.app_data::<web::Data<State>>().unwrap().db_pool.clone();

        Box::pin(async move {
            let config_key = newtypes::ObConfigurationKey::try_from(config_key?)
                .map_err(|_| AuthError::InvalidTokenForHeader(HEADER_NAME.to_string()))?;
            let (ob_config, tenant) = ObConfiguration::get_enabled(&pool, config_key).await?;
            Ok(Self {
                tenant,
                ob_config,
                phantom: PhantomData,
            })
        })
    }
}

use std::{marker::PhantomData, pin::Pin};

use actix_web::{web, FromRequest};
use db::models::{ob_configurations::ObConfiguration, tenants::Tenant};
use futures_util::Future;
use newtypes::ObConfigurationKey;
use paperclip::actix::Apiv2Header;

use crate::{auth::AuthError, State};

#[derive(Debug, Clone, Apiv2Header)]
/// SecretTenantAuthContext extracts a tenant's public key from the X-Onboarding-Config-Key header
/// which authenticates the client as a tenant.
pub struct PublicTenantAuthContext {
    #[allow(unused)]
    #[openapi(
        name = "X-Onboarding-Config-Key",
        description = "The onboarding publishable key"
    )]
    onboarding_key: ObConfigurationKey,
    #[openapi(skip)]
    pub tenant: Tenant,
    #[openapi(skip)]
    pub ob_config: ObConfiguration,
    #[openapi(skip)]
    phantom: PhantomData<()>,
}

const HEADER_NAME: &str = "X-Onboarding-Config-Key";

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

        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        Box::pin(async move {
            let key = newtypes::ObConfigurationKey::try_from(config_key?)
                .map_err(|_| AuthError::InvalidTokenForHeader(HEADER_NAME.to_string()))?;
            let (ob_config, tenant) = state
                .db_pool
                .db_query(|conn| ObConfiguration::get_enabled(conn, key))
                .await??
                .ok_or(AuthError::ApiKeyNotFound)?;
            Ok(PublicTenantAuthContext {
                onboarding_key: ob_config.key.clone(),
                tenant,
                ob_config,
                phantom: PhantomData,
            })
        })
    }

    fn extract(req: &actix_web::HttpRequest) -> Self::Future {
        Self::from_request(req, &mut actix_web::dev::Payload::None)
    }
}

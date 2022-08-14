use std::{marker::PhantomData, pin::Pin};

use actix_web::{web, FromRequest};
use db::models::{ob_configurations::ObConfiguration, tenants::Tenant};
use futures_util::Future;
use newtypes::ObConfigurationKey;
use paperclip::actix::Apiv2Header;

use crate::{auth::AuthError, State};

#[derive(Debug, Clone, Apiv2Header)]
/// SecretTenantAuthContext extracts a tenant's public key from the X-Client-Public-Key header
/// which authenticates the client as a tenant.
pub struct PublicTenantAuthContext {
    #[allow(unused)]
    #[openapi(name = "X-Client-Public-Key", description = "The onboarding publishable key")]
    onboarding_key: ObConfigurationKey,
    #[openapi(skip)]
    pub tenant: Tenant,
    #[openapi(skip)]
    pub ob_config: ObConfiguration,
    #[openapi(skip)]
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

        let static_req = req.clone();
        Box::pin(async move { from_request_inner(&static_req, config_key).await })
    }
}

pub async fn from_request_inner(
    req: &actix_web::HttpRequest,
    key: Result<String, AuthError>,
) -> Result<PublicTenantAuthContext, crate::ApiError> {
    let key = newtypes::ObConfigurationKey::try_from(key?)
        .map_err(|_| AuthError::InvalidTokenForHeader(HEADER_NAME.to_string()))?;
    let state = req.app_data::<web::Data<State>>().unwrap();
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
}

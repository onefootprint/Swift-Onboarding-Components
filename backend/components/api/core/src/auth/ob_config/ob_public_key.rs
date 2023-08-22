use std::{marker::PhantomData, pin::Pin};

use actix_web::{web, FromRequest};
use db::{
    models::{ob_configuration::ObConfiguration, tenant::Tenant},
    DbResult,
};
use futures_util::Future;
use paperclip::actix::Apiv2Security;

use crate::{auth::AuthError, State};

/// Extracts a publishable key from the X-Onboarding-Config-Key header
/// which indicates the tenant and onboarding configuration context
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Onboarding Config Publishable Key",
    in = "header",
    name = "X-Onboarding-Config-Key",
    description = "Long-lived, publishable key representing an onboarding configuration. You can create and view your credentials in the dashboard."
)]
pub struct PublicOnboardingContext {
    pub tenant: Tenant,
    pub ob_config: ObConfiguration,
    phantom: PhantomData<()>,
}

const HEADER_NAME: &str = "X-Onboarding-Config-Key";

impl FromRequest for PublicOnboardingContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        // get the tenant header
        let config_key = req
            .headers()
            .get(HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or_else(|| AuthError::MissingHeader(HEADER_NAME.to_owned()));

        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        Box::pin(async move {
            let key = newtypes::ObConfigurationKey::try_from(config_key?)
                .map_err(|_| AuthError::InvalidHeader(HEADER_NAME.to_owned()))?;
            let key2 = key.clone();
            let (ob_config, tenant) = state
                .db_pool
                .db_query(move |conn| -> DbResult<_> { ObConfiguration::get_enabled(conn, &key) })
                .await?
                .map_err(|e| -> Self::Error {
                    if e.is_not_found() {
                        // Slightly more informative error message when we can't find an ObConfig with this key
                        if key2.starts_with("sk_") {
                            AuthError::ApiKeyUsedForObConfig.into()
                        } else {
                            AuthError::ObConfigNotFound.into()
                        }
                    } else {
                        e.into()
                    }
                })?;

            tracing::info!(tenant_id=%tenant.id, ob_config_id=%ob_config.id, "pk_ob_session authenticated");

            Ok(PublicOnboardingContext {
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

use std::{marker::PhantomData, pin::Pin};

use actix_web::{web, FromRequest};
use db::models::{ob_configuration::ObConfiguration, tenant::Tenant};
use futures_util::Future;
use newtypes::ObConfigurationKey;
use paperclip::actix::Apiv2Header;

use crate::{
    auth::{tenant::ParsedOnboardingSession, AuthError, Either, SessionContext},
    State,
};

#[derive(Debug, Clone, Apiv2Header)]
/// Extracts a publishable key from the X-Onboarding-Config-Key header
/// which indicates the tenant and onboarding configuration context
pub struct PublicOnboardingContext {
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

impl FromRequest for PublicOnboardingContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        // get the tenant header
        let config_key = req
            .headers()
            .get(HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or(AuthError::MissingClientPublicAuthHeader);

        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        Box::pin(async move {
            let key = newtypes::ObConfigurationKey::try_from(config_key?)
                .map_err(|_| AuthError::InvalidTokenForHeader(HEADER_NAME.to_string()))?;
            let (ob_config, tenant) = state
                .db_pool
                .db_query(move |conn| ObConfiguration::get_enabled(conn, &key))
                .await?
                .map_err(|e| -> Self::Error {
                    if e.is_not_found() {
                        // Slightly more informative error message when we can't find an ObConfig with this key
                        AuthError::ApiKeyNotFound.into()
                    } else {
                        e.into()
                    }
                })?;

            tracing::info!(tenant_id=%tenant.id, ob_config_id=%ob_config.id, "pk_ob_session authenticated");

            Ok(PublicOnboardingContext {
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

/// Auth extractor for a short-lived session that represents the onboarding
pub type ObPkSessionAuth = SessionContext<ParsedOnboardingSession>;

/// Auth extractor for methods that
pub type ObPkAuth = Either<PublicOnboardingContext, ObPkSessionAuth>;

impl Either<PublicOnboardingContext, ObPkSessionAuth> {
    pub fn ob_config(&self) -> &ObConfiguration {
        match self {
            Either::Left(l) => &l.ob_config,
            Either::Right(r) => &r.data.ob_config,
        }
    }

    pub fn tenant(&self) -> &Tenant {
        match self {
            Either::Left(l) => &l.tenant,
            Either::Right(r) => &r.data.tenant,
        }
    }
}

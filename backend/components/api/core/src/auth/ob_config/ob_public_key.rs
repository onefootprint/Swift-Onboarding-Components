use std::{marker::PhantomData, pin::Pin};

use actix_web::{web, FromRequest};
use db::{
    models::{ob_configuration::ObConfiguration, tenant::Tenant},
    DbResult,
};
use futures_util::Future;
use paperclip::actix::Apiv2Security;

use crate::{auth::AuthError, errors::AssertionError, telemetry::RootSpan, State};

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

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        // get the tenant header
        let config_key = req
            .headers()
            .get(HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or_else(|| AuthError::MissingHeader(HEADER_NAME.to_owned()));

        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        let root_span = RootSpan::from_request(req, payload);

        Box::pin(async move {
            let root_span = root_span
                .await
                .map_err(|_| AssertionError("Cannot extract root span"))?;

            let key = newtypes::ObConfigurationKey::from(config_key?);
            let key2 = key.clone();
            let (ob_config, tenant) = state
                .db_pool
                .db_query(move |conn| -> DbResult<_> {
                    let (obc, tenant) = ObConfiguration::get_enabled(conn, &key)?;
                    // Temporary - see https://onefootprint.slack.com/archives/C05U1CAD6FQ/p1712959331008489
                    let new_coba_key =
                        newtypes::ObConfigurationKey::from("pb_live_u5tHhUCO1sqvEELugkpb2t".to_string());
                    let old_coba_key =
                        newtypes::ObConfigurationKey::from("ob_live_I5Au8tfp9Amzmuvr1lcNsq".to_string());
                    if obc.key == new_coba_key {
                        return ObConfiguration::get_enabled(conn, &old_coba_key);
                    }
                    Ok((obc, tenant))
                })
                .await
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
            root_span.record("tenant_id", &tenant.id.to_string());
            root_span.record("is_live", ob_config.is_live);
            root_span.record("auth_method", "ob_pk");

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

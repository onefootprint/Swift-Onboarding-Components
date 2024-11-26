use crate::auth::AuthError;
use crate::telemetry::RootSpan;
use crate::State;
use actix_web::web;
use actix_web::FromRequest;
use api_errors::FpDbOptionalExtension;
use api_errors::ServerErr;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::tenant::Tenant;
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use std::marker::PhantomData;
use std::pin::Pin;
use tracing::Instrument;

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
    pub playbook: Playbook,
    pub ob_config: ObConfiguration,
    phantom: PhantomData<()>,
}

impl PublicOnboardingContext {
    pub const HEADER_NAME: &'static str = "X-Onboarding-Config-Key";
}

impl FromRequest for PublicOnboardingContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    #[tracing::instrument("PublicOnboardingContext::from_request", skip_all)]
    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        // get the tenant header
        let config_key = req
            .headers()
            .get(Self::HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or_else(|| AuthError::MissingHeader(vec![Self::HEADER_NAME.to_owned()]));

        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();

        let root_span = RootSpan::from_request(req, payload);

        let extractor = async move {
            let root_span = root_span
                .await
                .map_err(|_| ServerErr("Cannot extract root span"))?;

            let key = newtypes::PublishablePlaybookKey::from(config_key?);
            let key2 = key.clone();
            let result = state
                .db_query(move |conn| Playbook::get_latest_version_if_enabled(conn, &key))
                .await;
            let (playbook, ob_config, tenant) = match result.optional() {
                Ok(Some((playbook, ob_config, tenant))) => (playbook, ob_config, tenant),
                Ok(None) => {
                    // Slightly more informative error message when we can't find an ObConfig with
                    // this key
                    if key2.starts_with("sk_") {
                        return Err(AuthError::ApiKeyUsedForObConfig.into());
                    } else {
                        return Err(AuthError::ObConfigNotFound.into());
                    }
                }
                Err(e) => return Err(e.into()),
            };

            tracing::info!(tenant_id=%tenant.id, playbook_id=%playbook.id, ob_config_id=%ob_config.id, "pk_ob_session authenticated");
            root_span.record("tenant_id", &tenant.id.to_string());
            root_span.record("is_live", playbook.is_live);
            root_span.record("auth_method", "ob_pk");

            Ok(PublicOnboardingContext {
                tenant,
                playbook,
                ob_config,
                phantom: PhantomData,
            })
        };
        Box::pin(extractor.in_current_span())
    }

    fn extract(req: &actix_web::HttpRequest) -> Self::Future {
        Self::from_request(req, &mut actix_web::dev::Payload::None)
    }
}

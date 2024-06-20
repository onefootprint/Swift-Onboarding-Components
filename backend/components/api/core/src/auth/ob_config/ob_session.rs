use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::errors::ApiError;
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Onboarding Config Token",
    in = "header",
    name = "X-Onboarding-Session-Token",
    description = "Short-lived token representing an onboarding configuration."
)]
pub struct ParsedOnboardingSession {
    pub tenant: Tenant,
    pub ob_config: ObConfiguration,
}

/// Auth extractor for a short-lived session that represents the onboarding
pub type ObPkSessionAuth = SessionContext<ParsedOnboardingSession>;

impl ExtractableAuthSession for ParsedOnboardingSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Onboarding-Session-Token"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
        _: RequestInfo,
    ) -> Result<Self, ApiError> {
        let data = match auth_session {
            AuthSessionData::OnboardingSession(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (ob_config, tenant) =
            ObConfiguration::get_enabled(conn, (&data.ob_config_id, &data.tenant_id, data.is_live))?;

        tracing::info!(tenant_id=%tenant.id, ob_config_id=%ob_config.id, "ob_session authenticated");

        Ok(ParsedOnboardingSession { ob_config, tenant })
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.tenant.id.to_string());
        root_span.record("is_live", self.ob_config.is_live);
        root_span.record("auth_method", "ob_session");
    }
}

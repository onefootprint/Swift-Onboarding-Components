use std::sync::Arc;

use db::{
    models::{ob_configuration::ObConfiguration, tenant::Tenant},
    PgConn,
};
use paperclip::actix::Apiv2Security;

use crate::auth::{
    session::{AuthSessionData, ExtractableAuthSession},
    SessionContext,
};
use crate::{auth::AuthError, errors::ApiError};
use feature_flag::{FeatureFlagClient};

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Onboarding-Session-Token",
    description = "Auth token for a dashboard user"
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
}

use db::{
    models::{ob_configuration::ObConfiguration, tenant::Tenant},
    PgConnection,
};
use newtypes::{ObConfigurationId, TenantId};
use paperclip::actix::Apiv2Security;

use crate::{
    auth::{AuthError, ExtractableAuthSession},
    errors::ApiError,
};

use super::AuthSessionData;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct OnboardingSession {
    pub tenant_id: TenantId,
    pub onboarding_id: ObConfigurationId,
    pub is_live: bool,
}

#[derive(Debug, Clone, Apiv2Security, serde::Serialize, serde::Deserialize)]
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

impl ExtractableAuthSession for ParsedOnboardingSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Onboarding-Session-Token"]
    }

    fn try_from(auth_session: AuthSessionData, conn: &mut PgConnection) -> Result<Self, ApiError> {
        let data = match auth_session {
            AuthSessionData::OnboardingSession(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (ob_config, tenant) =
            ObConfiguration::get_enabled_by_id(conn, data.onboarding_id, data.tenant_id, data.is_live)?;
        Ok(ParsedOnboardingSession { ob_config, tenant })
    }
}

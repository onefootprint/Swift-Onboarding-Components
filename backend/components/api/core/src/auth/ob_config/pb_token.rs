use crate::auth::session::onboarding::OnboardingSession;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::LoadSessionContext;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::FpResult;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::tenant::Tenant;
use db::PgConn;
use paperclip::actix::Apiv2Security;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Onboarding Config Token",
    in = "header",
    name = "X-Onboarding-Config-Key",
    description = "Short-lived token representing a playbook."
)]
pub struct ParsedOnboardingSession {
    pub tenant: Tenant,
    pub ob_config: ObConfiguration,
    pub data: OnboardingSession,
}

/// Auth extractor for a short-lived session that represents the playbook
pub type ObSessionAuth = SessionContext<ParsedOnboardingSession>;

impl ExtractableAuthSession for ParsedOnboardingSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Onboarding-Config-Key"]
    }

    fn try_load_session(
        conn: &mut PgConn,
        auth_session: AuthSessionData,
        _: LoadSessionContext,
    ) -> FpResult<Self> {
        let data = match auth_session {
            AuthSessionData::OnboardingSession(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (_, ob_config, tenant) = Playbook::get_latest_version_if_enabled(conn, &data.key)?;

        // TODO log token hash here
        tracing::info!(tenant_id=%tenant.id, ob_config_id=%ob_config.id, "ob_session authenticated");

        Ok(ParsedOnboardingSession {
            ob_config,
            tenant,
            data,
        })
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.tenant.id.to_string());
        root_span.record("is_live", self.ob_config.is_live);
        root_span.record("auth_method", "ob_session");
    }
}

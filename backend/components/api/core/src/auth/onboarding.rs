use super::session::onboarding::OnboardingSession;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::FpResult;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Onboarding token",
    in = "header",
    name = "X-Fp-Ob-Token",
    description = "Short-lived token representing onboarding arguments."
)]
pub struct ParsedOnboardingSession {
    pub data: OnboardingSession,
}

/// Auth extractor for a short-lived session that represents the onboarding
pub type OnboardingSessionContext = SessionContext<ParsedOnboardingSession>;

impl ExtractableAuthSession for ParsedOnboardingSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Ob-Token"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        _: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
        _: RequestInfo,
    ) -> FpResult<Self> {
        let data = match auth_session {
            AuthSessionData::OnboardingSession(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };

        Ok(ParsedOnboardingSession { data })
    }

    fn log_authed_principal(&self, _: tracing_actix_web::RootSpan) {}
}

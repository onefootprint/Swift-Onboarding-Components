use super::CheckedUserAuthContext;
use super::ParsedUserSessionContext;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::SessionContext;
use crate::FpResult;
use api_errors::ValidationError;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

#[derive(Debug, Clone, Apiv2Security, derive_more::Deref)]
#[openapi(
    apiKey,
    alias = "Integration Testing User Onboarding Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for an integration testing user during bifrost."
)]
pub struct ParsedItUserSession(pub ParsedUserSessionContext);

impl ExtractableAuthSession for ParsedItUserSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        value: AuthSessionData,
        conn: &mut PgConn,
        ff_client: Arc<dyn FeatureFlagClient>,
        req: RequestInfo,
    ) -> FpResult<Self> {
        // Since this is derived from a user session, we just grab all the user info
        let user_session = <ParsedUserSessionContext as ExtractableAuthSession>::try_load_session(
            value, conn, ff_client, req,
        )?;

        // This auth extractor is only used for integration tests to be able to get an fp_id from an
        // incomplete session. NOTE: Do not remove these validations below.
        if !user_session.0.tenant.as_ref().is_some_and(|t| t.is_demo_tenant) {
            return ValidationError("Can only use for demo tenants").into();
        }
        if user_session.0.user.is_live {
            return ValidationError("Can only use in sandbox mode").into();
        }

        Ok(ParsedItUserSession(user_session))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        <ParsedUserSessionContext as ExtractableAuthSession>::log_authed_principal(&self.0, root_span);
    }
}

/// A shorthand for the commonly used ParsedUserSession context.
/// Only extracts a user session linked to a scoped vault for the purpose of onboarding.
/// Optionally populates the Onboarding, ObConfig, and Tenant on the session if they exist
pub type ItUserAuthContext = SessionContext<ParsedItUserSession>;

impl ItUserAuthContext {
    pub fn into_inner(self) -> CheckedUserAuthContext {
        self.map(|d| d.0 .0)
    }
}

use super::ParsedUserWfSession;
use super::UserWfSession;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::auth::IsGuardMet;
use crate::auth::SessionContext;
use crate::FpResult;
use db::models::workflow::Workflow;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use newtypes::ScopedVaultId;
use newtypes::UserAuthScope;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

/// A wrapper around UserWfSession that can only be extracted when the auth token is for an active
/// onboarding session linked to a scoped business and with an in-progress business workflow.
/// We preload information for the scoped business and workflow that is commonly used by HTTP
/// handlers
#[derive(Debug, Clone, derive_more::Deref)]
pub struct UserBizWfSession {
    #[deref]
    pub user_wf_session: UserWfSession,
    pub sb_id: ScopedVaultId,
    pub biz_wf: Workflow,
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "User Onboarding Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for a user during bifrost. Issued by identify and contains scopes to perform specific user actions."
)]
pub struct ParsedUserBizWfSession(UserBizWfSession);

impl ExtractableAuthSession for ParsedUserBizWfSession {
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
        let user_wf_session =
            <ParsedUserWfSession as ExtractableAuthSession>::try_load_session(value, conn, ff_client, req)?.0;

        let sb_id = user_wf_session.sb_id.clone().ok_or(AuthError::MissingBusiness)?;

        let biz_wf_id = (user_wf_session.biz_wf_id.clone()).ok_or(AuthError::MissingBusinessWorkflow)?;
        let biz_wf = Workflow::get(conn, &biz_wf_id)?;

        let onboarding_session = UserBizWfSession {
            user_wf_session,
            sb_id,
            biz_wf,
        };
        Ok(ParsedUserBizWfSession(onboarding_session))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.0.tenant.id.to_string());
        root_span.record("fp_id", &self.0.scoped_user.fp_id.to_string());
        root_span.record("vault_id", &self.0.user.id.to_string());
        root_span.record("is_live", self.0.scoped_user.is_live);
        root_span.record("auth_method", "user_wf");
    }
}

/// A shorthand for the commonly used ParsedUserSession context.
/// Only extracts a user session linked to a scoped vault for the purpose of onboarding.
/// Optionally populates the Onboarding, ObConfig, and Tenant on the session if they exist
pub type UserBizWfAuthContext = SessionContext<ParsedUserBizWfSession>;

/// A shorthand for the commonly used UserSession context
pub type CheckUserBizWfAuthContext = SessionContext<UserBizWfSession>;

impl UserBizWfAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_guard<T>(self, guard: T) -> Result<CheckUserBizWfAuthContext, AuthError>
    where
        T: IsGuardMet<UserAuthScope>,
    {
        let requested_permission_str = guard.error_display(&self.0.user_session.scopes);
        if guard.is_met(&self.0.user_session.scopes) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingUserPermission(requested_permission_str))
        }
    }
}

impl CheckUserBizWfAuthContext {
    pub fn sb_id(&self) -> &ScopedVaultId {
        &self.sb_id
    }

    pub fn biz_wf(&self) -> &Workflow {
        &self.biz_wf
    }
}

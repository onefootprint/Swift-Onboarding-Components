use super::load_auth_events;
use super::ParsedUserSessionContext;
use super::UserSessionContext;
use crate::auth::session::user::AssociatedAuthEventKind;
use crate::auth::session::user::NewUserSessionContext;
use crate::auth::session::AllowSessionUpdate;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::LoadSessionContext;
use crate::auth::AuthError;
use crate::auth::IsGuardMet;
use crate::auth::SessionContext;
use crate::FpResult;
use api_errors::Unauthorized;
use db::models::auth_event::AuthEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::PgConn;
use newtypes::IdentifyScope;
use newtypes::UserAuthScope;
use paperclip::actix::Apiv2Security;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Identify Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for an identify session."
)]
pub struct IdentifySessionContext {
    pub user_session: UserSessionContext,
    pub scoped_user: ScopedVault,
    pub scoped_business: Option<ScopedVault>,
    pub playbook: Playbook,
    pub obc: ObConfiguration,
    pub tenant: Tenant,
    pub auth_events: Vec<(AuthEvent, AssociatedAuthEventKind)>,
    pub scope: IdentifyScope,
}

// Allow calling SessionContext<IdentifySessionContext>::update_session
impl AllowSessionUpdate for SessionContext<IdentifySessionContext> {}

impl IdentifySessionContext {
    pub const HEADER_NAME: &'static str = "X-Fp-Authorization";
}

impl ExtractableAuthSession for IdentifySessionContext {
    fn header_names() -> Vec<&'static str> {
        vec![IdentifySessionContext::HEADER_NAME]
    }

    fn try_load_session(
        conn: &mut PgConn,
        value: AuthSessionData,
        ctx: LoadSessionContext,
    ) -> FpResult<Self> {
        let user_session =
            <ParsedUserSessionContext as ExtractableAuthSession>::try_load_session(conn, value, ctx)?.0;

        // An identify session is stored as a user session. But, there are a few preconditions that we check
        // here
        if !UserAuthScope::IdentifySession.is_met(&user_session.scopes) {
            return Err(AuthError::MissingUserPermission(UserAuthScope::IdentifySession.to_string()).into());
        }

        let scope = user_session
            .identify_scope
            .ok_or(Unauthorized("Missing identify scope"))?;

        let scoped_user = user_session
            .scoped_user
            .clone()
            .ok_or(AuthError::MissingScopedUser)?;
        let scoped_business = (user_session.sb_id.as_ref())
            .map(|id| ScopedVault::get(conn, id))
            .transpose()?;

        let tenant = Tenant::get(conn, &scoped_user.tenant_id)?;

        let obc_id = (user_session.obc_id.as_ref()).ok_or(Unauthorized("Missing onboarding config"))?;
        let (playbook, obc) = ObConfiguration::get_enabled(conn, obc_id)?;

        let auth_events = load_auth_events(conn, &user_session.auth_events)?;

        let data = IdentifySessionContext {
            user_session,
            scoped_user,
            scoped_business,
            playbook,
            obc,
            tenant,
            auth_events,
            scope,
        };
        Ok(data)
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.tenant.id.to_string());
        root_span.record("fp_id", &self.scoped_user.fp_id.to_string());
        root_span.record("vault_id", &self.user_session.user.id.to_string());
        root_span.record("is_live", self.scoped_user.is_live);
        root_span.record("auth_method", "identify_session");
    }
}

/// A shorthand for the commonly used SessionContext<IdentifySessionContext>
pub type IdentifyAuthContext = SessionContext<IdentifySessionContext>;

impl IdentifyAuthContext {
    /// Computes all arguments on NewUserSessionContext that originate from ob config auth. This is
    /// used to issue a token for a new user, but with the same context from the ob config auth.
    pub fn ob_config_auth_context(&self) -> NewUserSessionContext {
        NewUserSessionContext {
            obc_id: Some(self.obc.id.clone()),
            // Business info
            bo_id: self.user_session.bo_id.clone(),
            sb_id: self.scoped_business.as_ref().map(|sb| sb.id.clone()),
            biz_wf_id: self.user_session.biz_wf_id.clone(),
            metadata: Some(self.user_session.metadata.clone()),
            // We omit any user fields
            su_id: None,
            ..Default::default()
        }
    }
}

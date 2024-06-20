use super::ParsedUserSessionContext;
use super::UserAuth;
use super::UserSessionContext;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::auth::IsGuardMet;
use crate::auth::SessionContext;
use crate::errors::ApiResult;
use crate::ApiError;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::models::workflow::WorkflowIdentifier;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use newtypes::ScopedVaultId;
use newtypes::UserAuthScope;
use newtypes::VaultId;
use newtypes::WorkflowGuard;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

/// A wrapper around UserSession that can only be extracted when the auth token is for an active
/// onboarding session linked to a scoped user.
/// We preload information for the scoped vault and onboarding that is commonly used by HTTP
/// handlers
#[derive(Debug, Clone)]
pub struct UserWfSession {
    pub user_session: UserSessionContext,
    pub scoped_user: ScopedVault,
    ob_config: ObConfiguration,
    tenant: Tenant,
    workflow: Workflow,
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "User Onboarding Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for a user during bifrost. Issued by identify and contains scopes to perform specific user actions."
)]
pub struct ParsedUserWfSession(UserWfSession);

impl ExtractableAuthSession for ParsedUserWfSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        value: AuthSessionData,
        conn: &mut PgConn,
        ff_client: Arc<dyn FeatureFlagClient>,
        req: RequestInfo,
    ) -> Result<Self, ApiError> {
        // Since this is derived from a user session, we just grab all the user info
        let user_session = <ParsedUserSessionContext as ExtractableAuthSession>::try_load_session(
            value, conn, ff_client, req,
        )?
        .0;

        let scoped_user = user_session
            .scoped_user
            .clone()
            .ok_or(AuthError::MissingScopedUser)?;

        let workflow_id = user_session.workflow_id().ok_or(AuthError::MissingWorkflow)?;
        let workflow = Workflow::get(conn, &workflow_id)?;
        let tenant = Tenant::get(conn, &scoped_user.tenant_id)?;

        // Get the obc and confirm it is active
        let (ob_config, _) = ObConfiguration::get_enabled(conn, &workflow.ob_configuration_id)?;

        let onboarding_session = UserWfSession {
            user_session,
            scoped_user,
            ob_config,
            tenant,
            workflow,
        };
        Ok(ParsedUserWfSession(onboarding_session))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.0.tenant.id.to_string());
        root_span.record("fp_id", &self.0.scoped_user.fp_id.to_string());
        root_span.record("vault_id", &self.0.user_vault_id().to_string());
        root_span.record("is_live", self.0.scoped_user.is_live);
        root_span.record("auth_method", "user_wf");
    }
}

/// A shorthand for the commonly used ParsedUserSession context.
/// Only extracts a user session linked to a scoped vault for the purpose of onboarding.
/// Optionally populates the Onboarding, ObConfig, and Tenant on the session if they exist
pub type UserWfAuthContext = SessionContext<ParsedUserWfSession>;

/// A shorthand for the commonly used UserSession context
pub type CheckUserWfAuthContext = SessionContext<UserWfSession>;

impl UserWfAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_guard<T>(self, guard: T) -> Result<CheckUserWfAuthContext, AuthError>
    where
        T: IsGuardMet<UserAuthScope>,
    {
        let requested_permission_str = format!("{}", guard);
        if guard.is_met(&self.0.user_session.scopes) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingUserPermission(requested_permission_str))
        }
    }
}

impl CheckUserWfAuthContext {
    pub fn scoped_business_id(&self) -> Option<ScopedVaultId> {
        self.user_session.scoped_business_id()
    }

    /// Get the business workflow associated with this auth token, if any
    pub fn business_workflow(&self, conn: &mut PgConn) -> ApiResult<Option<Workflow>> {
        let Some(sb_id) = self.scoped_business_id() else {
            return Ok(None);
        };
        let identifier = WorkflowIdentifier::ScopedBusinessId {
            sb_id: &sb_id,
            vault_id: self.user_vault_id(),
            is_business: (),
        };
        let (wf, _) = Workflow::get_all(conn, identifier)?;
        Ok(Some(wf))
    }
}

impl UserWfSession {
    pub fn ob_config(&self) -> &ObConfiguration {
        &self.ob_config
    }

    pub fn tenant(&self) -> &Tenant {
        // Don't use the tenant from the user_session since that comes from the OBC.
        // Always use the tenant from the SV
        &self.tenant
    }

    pub fn workflow(&self) -> &Workflow {
        &self.workflow
    }

    pub fn check_workflow_guard(&self, guard: WorkflowGuard) -> ApiResult<()> {
        // TODO we ideally want this to happen inside a locked transaction with the refreshed
        // workflow state, otherwise this could be stale
        // TODO to solve ^, maybe we add this check to the write path on the VW. I believe
        // everything checking this makes a new DataLifetime
        if self.workflow.deactivated_at.is_some() {
            return Err(AuthError::WorkflowDeactivated(guard).into());
        }
        let allowed_guards = self.workflow.state.allowed_guards();
        if !allowed_guards.contains(&guard) {
            Err(AuthError::MissingWorkflowGuard(guard).into())
        } else {
            Ok(())
        }
    }

    pub fn user(&self) -> &Vault {
        &self.user_session.user
    }
}

impl UserAuth for UserWfSession {
    fn user_vault_id(&self) -> &VaultId {
        self.user_session.user_vault_id()
    }
}

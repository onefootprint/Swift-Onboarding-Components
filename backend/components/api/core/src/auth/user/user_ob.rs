use std::sync::Arc;

use super::{UserAuth, UserAuthGuard};
use db::{
    models::{
        ob_configuration::ObConfiguration,
        scoped_vault::ScopedVault,
        tenant::Tenant,
        vault::Vault,
        workflow::{Workflow, WorkflowIdentifier},
    },
    PgConn,
};
use feature_flag::FeatureFlagClient;
use newtypes::{ScopedVaultId, VaultId, WorkflowGuard};
use paperclip::actix::Apiv2Security;

use crate::{
    auth::{
        session::{AuthSessionData, ExtractableAuthSession},
        AuthError, IsGuardMet, SessionContext,
    },
    errors::{onboarding::OnboardingError, workflow::WorkflowError, ApiResult},
    ApiError,
};

use super::{ParsedUserSessionContext, UserAuthScope, UserSessionContext};

/// A wrapper around UserSession that can only be extracted when the auth token is for an active
/// onboarding session linked to a scoped user.
/// We preload information for the scoped vault and onboarding that is commonly used by HTTP handlers
#[derive(Debug, Clone)]
pub struct UserObSession {
    user_session: UserSessionContext,
    pub scoped_user: ScopedVault,
    ob_config: Option<ObConfiguration>,
    tenant: Option<Tenant>,
    workflow: Option<Workflow>,
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "User Onboarding Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for a user during bifrost. Issued by identify and contains scopes to perform specific user actions."
)]
pub struct ParsedUserObSession(UserObSession);

impl ExtractableAuthSession for ParsedUserObSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        value: AuthSessionData,
        conn: &mut PgConn,
        ff_client: Arc<dyn FeatureFlagClient>,
    ) -> Result<Self, ApiError> {
        // Since this is derived from a user session, we just grab all the user info
        let user_session =
            <ParsedUserSessionContext as ExtractableAuthSession>::try_load_session(value, conn, ff_client)?.0;

        let Some(scoped_user_id) = user_session.scoped_user_id() else {
            return Err(AuthError::MissingScope(vec![UserAuthGuard::OrgOnboarding].into()))?;
        };

        // Confirm that the onboarding in the auth token belongs to the user
        let scoped_user = ScopedVault::get(conn, (&scoped_user_id, &user_session.user.id))?;

        let workflow = if let Some(wf_id) = user_session.workflow_id() {
            Some(Workflow::get(conn, &wf_id)?)
        } else {
            None
        };

        // Get the obc ID first from the workflow, the real source of truth.
        // Otherwise, get from OrgOnboarding scope.
        let scope_obc_id = user_session.ob_configuration_id();
        let obc_id = workflow
            .as_ref()
            .and_then(|wf| wf.ob_configuration_id.as_ref())
            .or(scope_obc_id.as_ref());

        let (ob_config, tenant) = if let Some(obc_id) = obc_id {
            // Confirm that the ob config is active
            let (ob_config, tenant) = ObConfiguration::get_enabled(conn, obc_id)?;
            (Some(ob_config), Some(tenant))
        } else {
            (None, None)
        };

        let onboarding_session = UserObSession {
            user_session,
            scoped_user,
            ob_config,
            tenant,
            workflow,
        };
        Ok(ParsedUserObSession(onboarding_session))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.0.tenant.as_ref().map(|t| t.id.to_string()));
        root_span.record("vault_id", &self.0.user_vault_id().to_string());
    }
}

/// A shorthand for the commonly used ParsedUserSession context.
/// Only extracts a user session linked to a scoped vault for the purpose of onboarding.
/// Optionally populates the Onboarding, ObConfig, and Tenant on the session if they exist
pub type UserObAuthContext = SessionContext<ParsedUserObSession>;

/// A shorthand for the commonly used UserSession context
pub type CheckedUserObAuthContext = SessionContext<UserObSession>;

impl UserObAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_guard<T>(self, guard: T) -> Result<CheckedUserObAuthContext, AuthError>
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

impl CheckedUserObAuthContext {
    /// Extracts the business vault_id from the `UserAuthScope::Business` scope on this session, if
    /// exists
    pub fn scoped_business_id(&self) -> Option<ScopedVaultId> {
        self.user_session
            .scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::Business(id) => Some(id.clone()),
                _ => None,
            })
            .next()
    }

    /// Extracts the business workflow from the `UserAuthScope::Business` scope on this session,
    /// if exists
    pub fn business_workflow(&self, conn: &mut PgConn) -> ApiResult<Option<Workflow>> {
        let Some(sb_id) = self.scoped_business_id() else {
            return Ok(None);
        };
        let identifier = WorkflowIdentifier::ScopedBusinessId {
            sb_id: &sb_id,
            vault_id: self.user_vault_id(),
        };
        let (wf, _) = Workflow::get_all(conn, identifier)?;
        Ok(Some(wf))
    }
}

impl UserObSession {
    pub fn ob_config(&self) -> ApiResult<&ObConfiguration> {
        let obc = self.ob_config.as_ref().ok_or(OnboardingError::NoOnboarding)?;
        Ok(obc)
    }

    pub fn tenant(&self) -> ApiResult<&Tenant> {
        let tenant = self.tenant.as_ref().ok_or(OnboardingError::NoOnboarding)?;
        Ok(tenant)
    }

    pub fn workflow(&self) -> ApiResult<&Workflow> {
        let wf = self.workflow.as_ref().ok_or(OnboardingError::NoWorkflow)?;
        Ok(wf)
    }

    pub fn check_workflow_guard(&self, guard: WorkflowGuard) -> ApiResult<()> {
        // TODO we ideally want this to happen inside a locked transaction with the refreshed
        // workflow state, otherwise this could be stale
        let allowed_guards = if let Some(wf) = self.workflow.as_ref() {
            wf.state.allowed_guards()
        } else {
            // If the auth token isn't associated with a workflow, allow everything for legacy.
            // This allows adding an email as soon as the vault is created
            vec![WorkflowGuard::AddData]
        };
        if !allowed_guards.contains(&guard) {
            Err(WorkflowError::MissingGuard(guard).into())
        } else {
            Ok(())
        }
    }

    pub fn user(&self) -> &Vault {
        &self.user_session.user
    }
}

impl UserAuth for UserObSession {
    fn user_vault_id(&self) -> &VaultId {
        self.user_session.user_vault_id()
    }
}

use std::sync::Arc;

use db::{models::vault::Vault, PgConn};
use itertools::Itertools;
use newtypes::{ObConfigurationId, ScopedVaultId, VaultId, VaultKind, WorkflowId};
use paperclip::actix::Apiv2Security;

use super::{UserAuthGuard, UserAuthScope};
use crate::{
    auth::{
        session::{
            user::{AuthFactor, UserSession, UserSessionArgs},
            AllowSessionUpdate, AuthSessionData, ExtractableAuthSession,
        },
        user::UserAuth,
        AuthError, IsGuardMet, SessionContext,
    },
    errors::{ApiError, ApiResult},
};
use feature_flag::FeatureFlagClient;

#[derive(Debug, Clone)]
pub struct UserSessionContext {
    pub user: Vault,
    pub scopes: Vec<UserAuthScope>,
    /// the auth method that was used
    pub auth_factors: Vec<AuthFactor>,
    pub(super) su_id: Option<ScopedVaultId>,
    pub(super) sb_id: Option<ScopedVaultId>,
    pub(super) obc_id: Option<ObConfigurationId>,
    pub(super) wf_id: Option<WorkflowId>,
}

impl UserSessionContext {
    pub fn did_use_passkey(&self) -> bool {
        self.auth_factors
            .iter()
            .any(|factor| matches!(factor, AuthFactor::Passkey(_)))
    }
}

impl UserAuth for UserSessionContext {
    fn user_vault_id(&self) -> &VaultId {
        &self.user.id
    }
}

// Allow calling SessionContext<T>::update for T=UserSessionContext
impl AllowSessionUpdate for UserSessionContext {}

impl UserSessionContext {
    pub fn session_with_added_scopes(self, new_scopes: Vec<UserAuthScope>) -> ApiResult<AuthSessionData> {
        self.update(UserSessionArgs::default(), new_scopes, None)
    }

    pub fn update(
        self,
        new_args: UserSessionArgs,
        new_scopes: Vec<UserAuthScope>,
        new_auth_factor: Option<AuthFactor>,
    ) -> ApiResult<AuthSessionData> {
        // Merge args, scopes, and auth factors and create a new session with these merged fields
        let new_scope_kinds = new_scopes.iter().map(UserAuthGuard::from).collect_vec();
        let new_scopes = self.scopes
            .into_iter()
            // Filter out any old scope of the same type
            .filter(|x| !new_scope_kinds.contains(&UserAuthGuard::from(x)))
            // And replace it with the new scope
            .chain(new_scopes.into_iter())
            .unique()
            .collect();

        let new_factors = if let Some(auth_factor) = new_auth_factor {
            self.auth_factors.into_iter().chain(vec![auth_factor]).collect()
        } else {
            self.auth_factors
        };

        let args = UserSessionArgs {
            su_id: new_args.su_id.or(self.su_id),
            sb_id: new_args.sb_id.or(self.sb_id),
            obc_id: new_args.obc_id.or(self.obc_id),
            wf_id: new_args.wf_id.or(self.wf_id),
        };
        UserSession::make(self.user.id, args, new_scopes, new_factors)
    }

    /// Extracts the scoped_user_id from the `UserAuthScope::OrgOnboarding` scope on this
    /// session, if exists
    pub fn scoped_user_id(&self) -> Option<ScopedVaultId> {
        // TODO rm
        let legacy_sv_id = self
            .scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::OrgOnboarding { id, .. } => Some(id.clone()),
                _ => None,
            })
            .next();
        self.su_id.clone().or(legacy_sv_id)
    }

    /// Extracts the ob_configuration_id from the `UserAuthScope::OnboardingConfig` scope on this
    /// session, if exists
    pub fn ob_configuration_id(&self) -> Option<ObConfigurationId> {
        // TODO rm
        let legacy_obc_id = self
            .scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::OrgOnboarding {
                    ob_configuration_id, ..
                } => ob_configuration_id.clone(),
                _ => None,
            })
            .next();
        self.obc_id.clone().or(legacy_obc_id)
    }

    pub fn workflow_id(&self) -> Option<WorkflowId> {
        let legacy_wf_id = self
            .scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::Workflow { wf_id } => Some(wf_id.clone()),
                _ => None,
            })
            .next();
        self.wf_id.clone().or(legacy_wf_id)
    }
}

/// Nests a private UserSession and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested UserSession is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested UserSession
#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "User Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions."
)]
pub struct ParsedUserSessionContext(pub(super) UserSessionContext);

impl ExtractableAuthSession for ParsedUserSessionContext {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        value: AuthSessionData,
        conn: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
    ) -> Result<Self, ApiError> {
        match value {
            AuthSessionData::User(data) => {
                let UserSession {
                    user_vault_id,
                    su_id,
                    sb_id,
                    wf_id,
                    obc_id,
                    scopes,
                    auth_factors,
                } = data;
                let vault = Vault::get(conn, &user_vault_id)?;
                if !vault.is_portable {
                    return Err(AuthError::NonPortableVault.into());
                }
                if vault.kind != VaultKind::Person {
                    return Err(AuthError::NonPersonVault.into());
                }
                tracing::info!(user_vault_id=%user_vault_id, "user session authenticated");
                let data = UserSessionContext {
                    user: vault,
                    su_id,
                    sb_id,
                    wf_id,
                    obc_id,
                    scopes,
                    auth_factors,
                };
                Ok(ParsedUserSessionContext(data))
            }
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("vault_id", &self.0.user.id.to_string());
    }
}

/// A shorthand for the commonly used ParsedUserSessionContext context
pub type UserAuthContext = SessionContext<ParsedUserSessionContext>;

/// A shorthand for the commonly used UserSession context
pub type CheckedUserAuthContext = SessionContext<UserSessionContext>;

impl UserAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_guard<T>(self, guard: T) -> Result<CheckedUserAuthContext, AuthError>
    where
        T: IsGuardMet<UserAuthScope>,
    {
        let requested_permission_str = format!("{}", guard);
        if guard.is_met(&self.0.scopes) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingUserPermission(requested_permission_str))
        }
    }
}

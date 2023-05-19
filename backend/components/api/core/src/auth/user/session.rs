use db::{models::vault::Vault, PgConn};
use itertools::Itertools;
use newtypes::{ScopedVaultId, VaultId, VaultKind, WorkflowId};
use paperclip::actix::Apiv2Security;

use super::{UserAuthGuard, UserAuthScope};
use crate::{
    auth::{
        session::{AllowSessionUpdate, AuthSessionData, ExtractableAuthSession},
        user::UserAuth,
        AuthError, IsGuardMet, SessionContext,
    },
    errors::ApiError,
};
use feature_flag::LaunchDarklyFeatureFlagClient;

/// A user-specific session. Permissions for the session are defined by the set of scopes.
/// IMPORTANT: Purposefully doesn't implement TryFrom<AuthSessionData> or HeaderName to prevent
/// users from using this in an actix extractor. UserAuthContext below should be used as the
/// extractor
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct UserSession {
    pub user_vault_id: VaultId,
    pub scopes: Vec<UserAuthScope>,
    // TODO Eventually might want to store auth methods to know if a token is generated from SMS, biometric, or via tenant trigger
}

impl UserSession {
    pub fn make(user_vault_id: VaultId, scopes: Vec<UserAuthScope>) -> AuthSessionData {
        AuthSessionData::User(Self {
            user_vault_id,
            scopes,
        })
    }
}

#[derive(Debug, Clone)]
pub struct UserSessionContext {
    pub user: Vault,
    pub scopes: Vec<UserAuthScope>,
}

impl UserAuth for UserSessionContext {
    fn user_vault_id(&self) -> &VaultId {
        &self.user.id
    }
}

// Allow calling SessionContext<T>::update for T=UserSessionContext
impl AllowSessionUpdate for UserSessionContext {}

impl UserSessionContext {
    pub fn session_with_added_scopes(self, new_scopes: Vec<UserAuthScope>) -> AuthSessionData {
        let new_scope_kinds = new_scopes.iter().map(UserAuthGuard::from).collect_vec();
        let new_scopes = self.scopes
            .into_iter()
            // Filter out any old scope of the same type
            .filter(|x| !new_scope_kinds.contains(&UserAuthGuard::from(x)))
            // And replace it with the new scope
            .chain(new_scopes.into_iter())
            .collect();
        UserSession::make(self.user.id, new_scopes)
    }

    /// Extracts the scoped_user_id from the `UserAuthScope::OrgOnboarding` scope on this
    /// session, if exists
    pub fn scoped_user_id(&self) -> Option<ScopedVaultId> {
        self.scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::OrgOnboarding { id } => Some(id.clone()),
                _ => None,
            })
            .next()
    }

    pub fn workflow_id(&self) -> Option<WorkflowId> {
        self.scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::Workflow { wf_id } => Some(wf_id.clone()),
                _ => None,
            })
            .next()
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
    in = "header",
    name = "X-Fp-Authorization",
    description = "Auth token for user"
)]
pub struct ParsedUserSessionContext(pub(super) UserSessionContext);

impl ExtractableAuthSession for ParsedUserSessionContext {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        value: AuthSessionData,
        conn: &mut PgConn,
        _: LaunchDarklyFeatureFlagClient,
    ) -> Result<Self, ApiError> {
        match value {
            AuthSessionData::User(data) => {
                let vault = Vault::get(conn, &data.user_vault_id)?;
                if !vault.is_portable {
                    return Err(AuthError::NonPortableVault.into());
                }
                if vault.kind != VaultKind::Person {
                    return Err(AuthError::NonPersonVault.into());
                }
                tracing::info!(user_vault_id=%data.user_vault_id, "user session authenticated");
                let data = UserSessionContext {
                    user: vault,
                    scopes: data.scopes,
                };
                Ok(ParsedUserSessionContext(data))
            }
            _ => Err(AuthError::SessionTypeError.into()),
        }
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

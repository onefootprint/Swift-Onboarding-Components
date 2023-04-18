use db::PgConn;
use itertools::Itertools;
use newtypes::{ScopedVaultId, VaultId};
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
}

// Allow calling SessionContext<T>::update for T=UserSession
impl AllowSessionUpdate for UserSession {}

impl UserSession {
    pub fn make(user_vault_id: VaultId, scopes: Vec<UserAuthScope>) -> AuthSessionData {
        AuthSessionData::User(Self {
            user_vault_id,
            scopes,
        })
    }

    pub fn add_scopes(self, new_scopes: Vec<UserAuthScope>) -> AuthSessionData {
        let new_scope_kinds = new_scopes.iter().map(UserAuthGuard::from).collect_vec();
        let new_scopes = self.scopes
            .into_iter()
            // Filter out any old scope of the same type
            .filter(|x| !new_scope_kinds.contains(&UserAuthGuard::from(x)))
            // And replace it with the new scope
            .chain(new_scopes.into_iter())
            .collect();
        Self::make(self.user_vault_id, new_scopes)
    }

    /// Extracts the scoped_user_id from the `UserAuthScope::OrgOnboardingInit` scope on this
    /// session, if exists
    pub fn scoped_user_id(&self) -> Option<ScopedVaultId> {
        self.scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::OrgOnboardingInit { id } => Some(id.clone()),
                _ => None,
            })
            .next()
    }
}

impl UserAuth for UserSession {
    fn user_vault_id(&self) -> &VaultId {
        &self.user_vault_id
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
pub struct ParsedUserSession(pub(super) UserSession);

impl ExtractableAuthSession for ParsedUserSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        value: AuthSessionData,
        _: &mut PgConn,
        _: LaunchDarklyFeatureFlagClient,
    ) -> Result<Self, ApiError> {
        match value {
            AuthSessionData::User(data) => {
                tracing::info!(user_vault_id=%data.user_vault_id, "user session authenticated");
                Ok(ParsedUserSession(data))
            }
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }
}

/// A shorthand for the commonly used ParsedUserSession context
pub type UserAuthContext = SessionContext<ParsedUserSession>;

/// A shorthand for the commonly used UserSession context
pub type CheckedUserAuthContext = SessionContext<UserSession>;

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

use db::{
    models::{
        ob_configuration::ObConfiguration, onboarding::Onboarding, scoped_user::ScopedUser, tenant::Tenant,
    },
    PgConnection,
};
use itertools::Itertools;
use newtypes::{ScopedUserId, UserVaultId};
use paperclip::actix::Apiv2Security;

use super::{UserAuthScope, UserAuthScopeDiscriminant};
use crate::{
    auth::{
        session::{AllowSessionUpdate, AuthSessionData, ExtractableAuthSession},
        user::UserAuth,
        AuthError, SessionContext,
    },
    errors::{ApiError, ApiResult},
};

/// A user-specific session. Permissions for the session are defined by the set of scopes.
/// IMPORTANT: Purposefully doesn't implement TryFrom<AuthSessionData> or HeaderName to prevent
/// users from using this in an actix extractor. The ParsableUserSession
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct UserSession {
    pub user_vault_id: UserVaultId,
    scopes: Vec<UserAuthScope>,
}

// Allow calling SessionContext<T>::update for T=UserSession
impl AllowSessionUpdate for UserSession {}

impl UserSession {
    pub fn make(user_vault_id: UserVaultId, scopes: Vec<UserAuthScope>) -> AuthSessionData {
        AuthSessionData::User(Self {
            user_vault_id,
            scopes,
        })
    }

    pub fn has_scope(&self, scope: &UserAuthScopeDiscriminant) -> bool {
        self.scopes
            .iter()
            .map(UserAuthScopeDiscriminant::from)
            .contains(scope)
    }

    pub fn add_scope(self, new_scope: UserAuthScope) -> AuthSessionData {
        let new_scope_kind = UserAuthScopeDiscriminant::from(&new_scope);
        let new_scopes = self.scopes
            .into_iter()
            // Filter out any old scope of the same type
            .filter(|x| UserAuthScopeDiscriminant::from(x) != new_scope_kind)
            // And replace it with the new scope
            .chain([new_scope].into_iter())
            .collect();
        Self::make(self.user_vault_id, new_scopes)
    }

    /// Allow introspection into the scopes on this auth token without exposing scope metadata
    pub fn scopes(&self) -> Vec<UserAuthScopeDiscriminant> {
        self.scopes.iter().map(|x| x.into()).collect()
    }
}

#[derive(Debug)]
pub struct AuthedOnboardingInfo {
    pub user_vault_id: UserVaultId,
    pub onboarding: Onboarding,
    pub scoped_user: ScopedUser,
    pub ob_config: ObConfiguration,
    pub tenant: Tenant,
}

impl SessionContext<UserSession> {
    /// Extracts the scoped_user_id from the `UserAuthScope::OrgOnboardingInit` scope on this
    /// session, if exists
    pub fn scoped_user_id(&self) -> Option<ScopedUserId> {
        self.data
            .scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::OrgOnboardingInit { id } => Some(id.clone()),
                _ => None,
            })
            .next()
    }

    /// Fetch the scoped_user info
    pub fn scoped_user(&self, conn: &mut PgConnection) -> ApiResult<Option<ScopedUser>> {
        let Some(scoped_user_id) = self.scoped_user_id() else {
            return Ok(None);
        };

        // Confirm that the scoped_user in the auth token belongs to the user
        let scoped_user = ScopedUser::get(conn, (&scoped_user_id, &self.data.user_vault_id))?;
        Ok(Some(scoped_user))
    }

    /// Fetch the onboarding info associated with this user token, if it exists
    pub fn onboarding(&self, conn: &mut PgConnection) -> ApiResult<Option<AuthedOnboardingInfo>> {
        if !self.data.has_scope(&UserAuthScopeDiscriminant::OrgOnboarding) {
            // If there is no Onboarding scope on this auth token, the Onboarding won't exist
            return Ok(None);
        }

        let Some(scoped_user_id) = self.scoped_user_id() else {
            return Ok(None);
        };

        // Confirm that the onboarding in the auth token belongs to the user
        let (onboarding, scoped_user, _, _) =
            Onboarding::get(conn, (&scoped_user_id, &self.data.user_vault_id))?;
        // Confirm that the ob config is active
        let (ob_config, tenant) = ObConfiguration::get_enabled(conn, &onboarding.ob_configuration_id)?;
        let info = AuthedOnboardingInfo {
            user_vault_id: self.data.user_vault_id.clone(),
            onboarding,
            scoped_user,
            ob_config,
            tenant,
        };
        Ok(Some(info))
    }

    /// Assert that the onboarding info exists for this user auth token and return it.
    /// Useful as a shorthand for endpoints along the onboarding flow
    pub fn assert_onboarding(&self, conn: &mut PgConnection) -> ApiResult<AuthedOnboardingInfo> {
        let info = self
            .onboarding(conn)?
            .ok_or_else(|| AuthError::MissingScope(vec![UserAuthScopeDiscriminant::OrgOnboarding]))?;
        Ok(info)
    }
}

impl UserAuth for UserSession {
    fn user_vault_id(&self) -> &UserVaultId {
        &self.user_vault_id
    }
}

/// Nests a private UserSession and implements traits required to extract this session from an
/// actix request.
/// Notably, this struct isn't very useful since the entire nested UserSession is hidden. If you
/// want to do something useful, you likely have to enforce permissions by calling
/// `check_permissions`, which will give you the more useful nested UserSession
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Security)]
#[serde(transparent)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fp-Authorization",
    description = "Auth token for user"
)]
pub struct ParsedUserSession(UserSession);

impl ExtractableAuthSession for ParsedUserSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_from(value: AuthSessionData, _conn: &mut PgConnection) -> Result<Self, ApiError> {
        match value {
            AuthSessionData::User(data) => {
                tracing::info!(user_vault_id=%data.user_vault_id, "user session authenticated");
                Ok(ParsedUserSession(data))
            }
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }
}

impl ParsedUserSession {
    fn are_permissions_met(&self, requested_permissions: &[UserAuthScopeDiscriminant]) -> bool {
        requested_permissions.iter().any(|s| self.0.has_scope(s))
    }
}

/// A shorthand for the commonly used ParsedUserSession context
pub type UserAuthContext = SessionContext<ParsedUserSession>;

impl UserAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_permissions<T>(
        self,
        requested_permissions: Vec<T>,
    ) -> Result<SessionContext<UserSession>, AuthError>
    where
        T: Into<UserAuthScopeDiscriminant>,
    {
        let requested_permissions: Vec<_> = requested_permissions.into_iter().map(|x| x.into()).collect();
        if self.data.are_permissions_met(&requested_permissions) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingScope(requested_permissions))
        }
    }
}

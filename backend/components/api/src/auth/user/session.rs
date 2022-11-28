use db::{
    models::{
        ob_configuration::ObConfiguration, onboarding::Onboarding, scoped_user::ScopedUser, tenant::Tenant,
    },
    PgConnection,
};
use itertools::Itertools;
use newtypes::UserVaultId;
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

    pub fn replace_scope(self, new_scope: UserAuthScope) -> AuthSessionData {
        let new_scope2 = new_scope.clone();
        let new_scopes = self.scopes
            .iter()
            .cloned()
            // Filter out any old scope of the same type
            .filter(move |x| UserAuthScopeDiscriminant::from(x) != UserAuthScopeDiscriminant::from(&new_scope2))
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
    /// Fetch the onboarding info associated with this user token, if it exists
    pub fn onboarding(&self, conn: &mut PgConnection) -> ApiResult<Option<AuthedOnboardingInfo>> {
        let onboarding_id = self
            .data
            .scopes
            .iter()
            .filter_map(|x| match x {
                UserAuthScope::OrgOnboarding { id } => Some(id.clone()),
                _ => None,
            })
            .next();
        let Some(onboarding_id) = onboarding_id else {
            return Ok(None);
        };

        // Confirm that the onboarding in the auth token belongs to the user
        let (onboarding, scoped_user, _, _) =
            Onboarding::get(conn, (&onboarding_id, &self.data.user_vault_id))?;
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
    fn user_vault_id(&self) -> UserVaultId {
        self.user_vault_id.clone()
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
            },
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }
}

impl ParsedUserSession {
    pub fn check_permissions<T>(self, scopes: Vec<T>) -> Result<UserSession, AuthError>
    where
        T: Into<UserAuthScopeDiscriminant>,
    {
        let scope_discriminants: Vec<_> = scopes.into_iter().map(|x| x.into()).collect();
        if scope_discriminants.iter().any(|s| self.0.has_scope(s)) {
            Ok(self.0)
        } else {
            Err(AuthError::MissingScope(scope_discriminants))
        }
    }
}

/// A shorthand for the commonly used ParsedUserSession context
pub type UserAuthContext = SessionContext<ParsedUserSession>;

impl UserAuthContext {
    /// Verifies that the auth token has one of the required scopes. If so, returns a UserAuth
    /// that is accessible
    pub fn check_permissions<T>(self, scopes: Vec<T>) -> Result<SessionContext<UserSession>, AuthError>
    where
        T: Into<UserAuthScopeDiscriminant>,
    {
        self.map(|c| c.check_permissions(scopes))
    }
}

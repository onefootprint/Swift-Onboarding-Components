use db::PgConnection;
use newtypes::UserVaultId;
use paperclip::actix::Apiv2Security;

use super::{UserAuthScope, UserAuthScopeDiscriminant};
use crate::{
    auth::{
        session::{AuthSessionData, ExtractableAuthSession},
        user::UserAuth,
        AuthError, SessionContext,
    },
    errors::ApiError,
};

/// A user-specific session. Permissions for the session are defined by the set of scopes.
/// IMPORTANT: Purposefully doesn't implement TryFrom<AuthSessionData> or HeaderName to prevent
/// users from using this in an actix extractor. The ParsableUserSession
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct UserSession {
    pub user_vault_id: UserVaultId,
    pub scopes: Vec<UserAuthScope>,
}

impl UserSession {
    pub fn create(user_vault_id: UserVaultId, scopes: Vec<UserAuthScope>) -> AuthSessionData {
        AuthSessionData::User(Self {
            user_vault_id,
            scopes,
        })
    }

    pub fn has_scope(&self, scope: &UserAuthScopeDiscriminant) -> bool {
        let discriminants: Vec<UserAuthScopeDiscriminant> = self.scopes.iter().map(|x| x.into()).collect();
        discriminants.contains(scope)
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
            AuthSessionData::User(data) => Ok(ParsedUserSession(data)),
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

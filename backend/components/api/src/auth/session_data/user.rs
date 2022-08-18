use db::PgConnection;
use newtypes::UserVaultId;
use paperclip::actix::{Apiv2Schema, Apiv2Security};

use crate::{
    auth::{session_data::AuthSessionData, AuthError, ExtractableAuthSession, VerifiedUserAuth},
    errors::ApiError,
};

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone, Copy, Apiv2Schema)]
#[serde(rename = "snake_case")]
pub enum UserAuthScope {
    // This is just the initial scope - we will update this to have scopes that represent perms for
    // all the different kinds of user tokens in the future
    All,
    SignUp,
    OrgOnboarding,
    BasicProfile,
    ExtendedProfile,
    SensitiveProfile,
    Handoff,
}

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

    pub fn has_scope(&self, scope: UserAuthScope) -> bool {
        self.scopes.contains(&scope)
    }
}

impl VerifiedUserAuth for UserSession {
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
    pub fn check_permissions(self, scopes: Vec<UserAuthScope>) -> Result<UserSession, AuthError> {
        if scopes.iter().any(|s| self.0.has_scope(s.to_owned())) {
            Ok(self.0)
        } else {
            Err(AuthError::MissingScope(scopes))
        }
    }
}

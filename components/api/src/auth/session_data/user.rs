use newtypes::UserVaultId;
use paperclip::actix::Apiv2Schema;

use crate::{
    auth::{
        session_context::HasUserVaultId,
        session_data::{HeaderName, SessionData},
        AuthError,
    },
    errors::ApiError,
};

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Debug, Clone, Copy, Apiv2Schema)]
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

/// A user-specific session. Permissions for the session are defined by the set of issues scopes
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct UserSession {
    pub user_vault_id: UserVaultId,
    pub scopes: Vec<UserAuthScope>,
}

impl UserSession {
    pub fn create(user_vault_id: UserVaultId, scopes: Vec<UserAuthScope>) -> SessionData {
        SessionData::User(Self {
            user_vault_id,
            scopes,
        })
    }

    pub fn has_scope(&self, scope: UserAuthScope) -> bool {
        self.scopes.contains(&scope)
    }

    pub fn enforce_has_any(&self, scopes: Vec<UserAuthScope>) -> Result<(), AuthError> {
        if scopes.iter().any(|s| self.has_scope(s.to_owned())) {
            Ok(())
        } else {
            Err(AuthError::MissingScope(scopes))
        }
    }
}

impl TryFrom<SessionData> for UserSession {
    type Error = ApiError;

    fn try_from(value: SessionData) -> Result<Self, Self::Error> {
        match value {
            SessionData::User(data) => Ok(data),
            _ => Err(AuthError::SessionTypeError.into()),
        }
    }
}

impl HeaderName for UserSession {
    fn header_names() -> Vec<&'static str> {
        vec![
            "X-Fpuser-Authorization",
            "X-My1fp-Authorization",
            "X-D2p-Authorization",
        ]
    }
}

impl HasUserVaultId for UserSession {
    fn user_vault_id(&self) -> UserVaultId {
        self.user_vault_id.clone()
    }
}

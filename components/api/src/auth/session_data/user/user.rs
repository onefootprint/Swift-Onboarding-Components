use newtypes::UserVaultId;
use paperclip::actix::Apiv2Schema;

use crate::{
    auth::{
        session_context::HasUserVaultId,
        session_data::{HeaderName, SessionData},
        uv_permission::{HasVaultPermission, VaultPermission},
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

impl HasVaultPermission for UserAuthScope {
    fn has_permission(&self, _permission: VaultPermission) -> bool {
        // TODO get rid of old permission model
        true
    }
}

/// A user-specific session. Permissions for the session are defined by the set of issues scopes
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct UserSession {
    pub user_vault_id: UserVaultId,
    pub scopes: Vec<UserAuthScope>,
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
    fn header_name() -> String {
        "X-Fpuser-Authorization".to_owned()
    }
}

impl HasVaultPermission for UserSession {
    fn has_permission(&self, permission: VaultPermission) -> bool {
        self.scopes.iter().any(|scope| scope.has_permission(permission))
    }
}

impl HasUserVaultId for UserSession {
    fn user_vault_id(&self) -> UserVaultId {
        self.user_vault_id.clone()
    }
}

use super::SessionContext;
use crate::errors::ApiError;
use async_trait::async_trait;
use db::{models::user_vault::UserVault, DbPool};
use newtypes::UserVaultId;
use paperclip::actix::Apiv2Schema;

mod session;
pub use session::*;
mod email_verify;
pub use email_verify::*;
mod validate_user;
pub use validate_user::*;

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

/// A helper trait to extract a user vault id on combined types
#[async_trait]
pub trait VerifiedUserAuth {
    fn user_vault_id(&self) -> UserVaultId;

    async fn user_vault(&self, pool: &DbPool) -> Result<UserVault, ApiError> {
        Ok(db::user_vault::get(pool, self.user_vault_id()).await?)
    }
}

impl<A> VerifiedUserAuth for SessionContext<A>
where
    A: VerifiedUserAuth,
{
    fn user_vault_id(&self) -> UserVaultId {
        self.data.user_vault_id()
    }
}

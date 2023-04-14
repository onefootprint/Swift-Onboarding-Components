use super::SessionContext;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{models::vault::Vault, DbPool};
use newtypes::{ScopedVaultId, VaultId};
use paperclip::actix::Apiv2Schema;

mod session;
pub use session::*;
mod email_verify;
pub use email_verify::*;
mod validate_user;
use strum::EnumDiscriminants;
pub use validate_user::*;
mod guard;

#[derive(
    serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone, Apiv2Schema, EnumDiscriminants,
)]
#[strum_discriminants(name(UserAuthGuard))]
#[strum_discriminants(derive(Apiv2Schema, serde::Serialize, strum_macros::Display, Hash))]
#[strum_discriminants(vis(pub))]
#[serde(rename = "snake_case")]
pub enum UserAuthScope {
    SignUp,
    OrgOnboardingInit {
        id: ScopedVaultId,
    },
    OrgOnboarding,
    Business(ScopedVaultId),
    // We don't currently issue a token with this - was for my1fp
    BasicProfile,
    Handoff,

    /// This scope should never be issued to a token - it is used to gate certain actions that
    /// should never be done by a user
    Never,
}

/// A helper trait to extract a user vault id on combined types
#[async_trait]
pub trait UserAuth {
    fn user_vault_id(&self) -> &VaultId;

    async fn user_vault(&self, pool: &DbPool) -> ApiResult<Vault> {
        let uv_id = self.user_vault_id().clone();
        let result = pool.db_query(move |conn| Vault::get(conn, &uv_id)).await??;
        Ok(result)
    }
}

impl<A> UserAuth for SessionContext<A>
where
    A: UserAuth,
{
    fn user_vault_id(&self) -> &VaultId {
        self.data.user_vault_id()
    }
}

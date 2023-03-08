use super::SessionContext;
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{models::vault::Vault, DbPool};
use newtypes::{ScopedUserId, VaultId};
use paperclip::actix::Apiv2Schema;

mod session;
pub use session::*;
mod email_verify;
pub use email_verify::*;
mod validate_user;
use strum::EnumDiscriminants;
pub use validate_user::*;

#[derive(
    serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone, Apiv2Schema, EnumDiscriminants,
)]
#[strum_discriminants(name(UserAuthScopeDiscriminant))]
#[strum_discriminants(derive(Apiv2Schema, serde::Serialize, strum_macros::Display))]
#[strum_discriminants(vis(pub))]
#[serde(rename = "snake_case")]
pub enum UserAuthScope {
    SignUp,
    OrgOnboardingInit { id: ScopedUserId },
    OrgOnboarding,
    Business(ScopedUserId),
    BasicProfile,
    ExtendedProfile,
    SensitiveProfile,
    Handoff,
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

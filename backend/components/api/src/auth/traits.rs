use async_trait::async_trait;
use db::{
    models::{tenant::Tenant, user_vault::UserVault},
    DbPool, PgConnection,
};
use newtypes::UserVaultId;

use crate::errors::ApiError;

use super::session_data::AuthSessionData;

/// A helper trait to extract a user vault id on combined types
#[async_trait]
pub trait VerifiedUserAuth {
    fn user_vault_id(&self) -> UserVaultId;

    async fn user_vault(&self, pool: &DbPool) -> Result<UserVault, ApiError> {
        Ok(db::user_vault::get(pool, self.user_vault_id()).await?)
    }
}

/// A helper trait to get a Tenant on combined objects
pub trait HasTenant {
    fn tenant(&self) -> &Tenant;
}

/// A helper trait to extract whether the auth session is for sandbox or production data
pub trait IsLive {
    fn is_live(&self) -> Result<bool, ApiError>;
}

pub trait SupportsIsLiveHeader {}

/// Allows an auth session to be extracted from an actix request using the extractor SessionContext utility
pub trait ExtractableAuthSession: Sized + Send + Sync + 'static {
    fn header_names() -> Vec<&'static str>;

    fn try_from(auth_session: AuthSessionData, conn: &mut PgConnection) -> Result<Self, ApiError>;
}

/// Principal that is behind the SessionContext
pub trait Principal {
    fn format_principal(&self) -> String;
}

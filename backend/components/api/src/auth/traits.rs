use async_trait::async_trait;
use db::{
    models::{tenant::Tenant, user_vault::UserVault},
    DbPool, PgConnection,
};
use newtypes::{TenantPermission, UserVaultId};

use crate::errors::ApiError;

use super::{session_data::AuthSessionData, AuthError};

/// A helper trait to extract a user vault id on combined types
#[async_trait]
pub trait VerifiedUserAuth {
    fn user_vault_id(&self) -> UserVaultId;

    async fn user_vault(&self, pool: &DbPool) -> Result<UserVault, ApiError> {
        Ok(db::user_vault::get(pool, self.user_vault_id()).await?)
    }
}

/// Allows an auth session to be extracted from an actix request using the extractor SessionContext utility
pub trait ExtractableAuthSession: Sized + Send + Sync + 'static {
    fn header_names() -> Vec<&'static str>;

    fn try_from(auth_session: AuthSessionData, conn: &mut PgConnection) -> Result<Self, ApiError>;
}

pub trait TenantAuth {
    fn tenant(&self) -> &Tenant;
    fn format_principal(&self) -> String;
    fn is_live(&self) -> Result<bool, ApiError>;
}

pub trait CheckTenantPermissions {
    fn check_permissions(self, permissions: Vec<TenantPermission>) -> Result<Box<dyn TenantAuth>, AuthError>;
}

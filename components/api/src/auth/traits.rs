use async_trait::async_trait;
use db::{
    models::{tenants::Tenant, user_vaults::UserVault},
    DbPool,
};
use newtypes::{TenantId, UserVaultId};

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

/// A helper trait to get a Tenant on combined objects
#[async_trait]
pub trait HasTenant {
    fn tenant_id(&self) -> TenantId;

    fn is_sandbox_restricted(&self) -> bool;

    async fn tenant(&self, pool: &DbPool) -> Result<Tenant, ApiError> {
        Ok(db::tenant::get_tenant(pool, self.tenant_id()).await?)
    }
}

/// A helper trait to extract whether the auth session is for sandbox or production data
pub trait IsLive {
    fn is_live(&self) -> Result<bool, AuthError>;
}

pub trait SupportsIsLiveHeader {}

/// Allows an auth session to be extracted from an actix request using the extractor SessionContext utility
pub trait ExtractableAuthSession: TryFrom<AuthSessionData> {
    fn header_names() -> Vec<&'static str>;
}


/// Principal that is behind the SessionContext
pub trait Principal {
    fn format_principal(&self) -> String;
}
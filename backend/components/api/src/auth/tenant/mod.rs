mod ob_public_key;
use db::models::tenant::Tenant;
pub use ob_public_key::*;
mod secret_key;
pub use secret_key::*;
mod ob_session;
pub use ob_session::*;
mod workos;
pub use self::workos::*;

use super::AuthError;
use crate::errors::ApiError;
use newtypes::{DataAttribute, DbActor, TenantApiKeyId, TenantPermission, TenantUserId};

pub trait TenantAuth {
    fn tenant(&self) -> &Tenant;
    fn format_principal(&self) -> String;
    fn is_live(&self) -> Result<bool, ApiError>;
    fn actor(&self) -> AuthActor;
}

#[derive(Clone)]
pub enum AuthActor {
    TenantUser(TenantUserId),
    TenantApiKey(TenantApiKeyId),
}

impl From<TenantUserId> for AuthActor {
    fn from(tenant_user_id: TenantUserId) -> Self {
        Self::TenantUser(tenant_user_id)
    }
}

impl From<TenantApiKeyId> for AuthActor {
    fn from(tenant_api_key_id: TenantApiKeyId) -> Self {
        Self::TenantApiKey(tenant_api_key_id)
    }
}

impl From<AuthActor> for DbActor {
    fn from(auth_actor: AuthActor) -> Self {
        match auth_actor {
            AuthActor::TenantUser(tenant_user_id) => DbActor::TenantUser { id: tenant_user_id },
            AuthActor::TenantApiKey(tenant_api_key_id) => DbActor::TenantApiKey {
                id: tenant_api_key_id,
            },
        }
    }
}

pub trait CheckTenantPermissions {
    fn check_permissions(self, permissions: Vec<TenantPermission>) -> Result<Box<dyn TenantAuth>, AuthError>;
    fn can_decrypt(self, attributes: Vec<DataAttribute>) -> Result<Box<dyn TenantAuth>, AuthError>;
}

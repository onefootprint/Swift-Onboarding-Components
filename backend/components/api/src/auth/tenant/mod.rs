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
use newtypes::{DataAttribute, TenantPermission};

pub trait VerifiedTenantAuth {
    fn tenant(&self) -> &Tenant;
    fn format_principal(&self) -> String;
    fn is_live(&self) -> Result<bool, ApiError>;
}

pub trait CheckTenantPermissions {
    fn check_permissions(
        self,
        permissions: Vec<TenantPermission>,
    ) -> Result<Box<dyn VerifiedTenantAuth>, AuthError>;
    fn can_decrypt(self, attributes: Vec<DataAttribute>) -> Result<Box<dyn VerifiedTenantAuth>, AuthError>;
}

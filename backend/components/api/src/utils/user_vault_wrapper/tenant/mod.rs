mod accessors;
mod build;
mod decrypt;
mod decrypt_request;

pub mod checks;
pub mod identity_document;

use db::models::ob_configuration::ObConfiguration;
pub use decrypt_request::DecryptRequest;

use super::UserVaultWrapper;
use newtypes::ScopedUserId;

/// Constructed for a specific tenant's view of the world. A tenant is able to see its own uncommitted
/// data on the user vault.
/// This UVW variant contains all of the functionality to decrypt information on the vault
pub struct TenantUvw {
    uvw: UserVaultWrapper,
    scoped_user_id: ScopedUserId,
    authorized_ob_configs: Vec<ObConfiguration>,
}

/// Allow calling any Uvw functions from TenantUvw
impl std::ops::Deref for TenantUvw {
    type Target = UserVaultWrapper;

    fn deref(&self) -> &Self::Target {
        &self.uvw
    }
}

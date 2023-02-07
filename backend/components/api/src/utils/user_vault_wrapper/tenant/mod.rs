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

use derive_more::Deref;

/// Constructed for a specific tenant's view of the world. A tenant is able to see its own speculative
/// data on the user vault.
/// This UVW variant contains all of the functionality to decrypt information on the vault
#[derive(Deref)]
pub struct TenantUvw {
    #[deref]
    uvw: UserVaultWrapper,
    scoped_user_id: ScopedUserId,
    authorized_ob_configs: Vec<ObConfiguration>,
}

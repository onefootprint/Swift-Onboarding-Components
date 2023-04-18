mod accessors;
mod build;
pub mod checks;
mod decrypt;
mod decrypt_request;
pub mod document;

use db::models::onboarding::OnboardingAndConfig;
pub use decrypt_request::DecryptRequest;

use super::{Any, VaultWrapper};
use newtypes::ScopedVaultId;

use derive_more::Deref;
pub mod fingerprint;

/// Constructed for a specific tenant's view of the world. A tenant is able to see its own speculative
/// data on the user vault.
/// This UVW variant contains all of the functionality to decrypt information on the vault
#[derive(Deref)]
// TODO Rename to TenantVw
pub struct TenantUvw<Type = Any> {
    #[deref]
    uvw: VaultWrapper<Type>,
    pub scoped_vault_id: ScopedVaultId,
    pub onboarding: Option<OnboardingAndConfig>,
}

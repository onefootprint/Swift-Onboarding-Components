mod accessors;
mod build;
mod decrypt;
mod decrypt_request;
mod delete;

use db::models::{onboarding::OnboardingAndConfig, scoped_vault::ScopedVault};
pub use decrypt_request::DecryptRequest;

use super::{Any, VaultWrapper};

use derive_more::Deref;
pub mod fingerprint;

/// Constructed for a specific tenant's view of the world. A tenant is able to see its own speculative
/// data on the user vault.
/// This UVW variant contains all of the functionality to decrypt information on the vault
#[derive(Deref)]
pub struct TenantVw<Type = Any> {
    #[deref]
    uvw: VaultWrapper<Type>,
    pub scoped_vault: ScopedVault,
    pub onboarding: Option<OnboardingAndConfig>,
}

mod accessors;
mod build;
mod bulk_decrypt;
mod decrypt;

use super::Any;
use super::VaultWrapper;
pub use bulk_decrypt::*;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::WorkflowAndConfig;
use derive_more::Deref;

/// Constructed for a specific tenant's view of the world. A tenant is able to see its own
/// speculative data on the user vault.
/// This UVW variant contains all of the functionality to decrypt information on the vault
#[derive(Deref)]
pub struct TenantVw<Type = Any> {
    #[deref]
    uvw: VaultWrapper<Type>,
    pub scoped_vault: ScopedVault,
    pub workflows: Vec<WorkflowAndConfig>,
}

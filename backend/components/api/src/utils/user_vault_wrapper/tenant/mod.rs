mod accessors;
mod add_data;
mod build;
mod commit_data;
mod decrypt;
mod decrypt_request;
mod uvd_builder;

pub mod checks;
pub mod identity_document;

pub use add_data::UvwAddData;
pub use commit_data::UvwCommitData;
use db::models::ob_configuration::ObConfiguration;
pub use decrypt_request::DecryptRequest;

use super::UserVaultWrapper;
use newtypes::{Locked, ScopedUserId};

/// Constructed for a specific tenant's view of the world. A tenant is able to see its own uncommitted
/// data on the user vault
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

/// Context:
///
/// UserVaultWrapper is a rather powerful structure since it is the gate keeper to viewing a user's vault AND to updating the vault.
/// Therefore it's important we do not read or write stale data (unless we want to for some reason explicitly).
///
/// Consider an update of vaulted data:
///    Previously, we'd keep track of whether a UVW was locked by 1) locking rows in Postgres and 2) setting `UVW.is_locked = true`.
///    
///    The situation we are guarding against is an in-memory UVW object being returned from a closure and then, somewhere else, entering another _different_
///    DB transaction and writing stale data.
///
/// Since LockedUserVaultWrapper is not Sync/Send, we know that it cannot enter multiple threads at once AND (more importantly) it cannot be returned from a closure, leading
/// to us using the stale data.
pub type LockedTenantUvw = Locked<TenantUvw>;

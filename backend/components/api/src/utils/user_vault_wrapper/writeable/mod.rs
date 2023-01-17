use newtypes::{Locked, ScopedUserId};

use super::UserVaultWrapper;

mod add_data;
mod build;
mod commit_data;
mod uvd_builder;

/// This specific subset variant of UserVaultWrapper contains all the logic to write new data into a user's vault.
/// It can only be constructed via a ScopedUserId.
///
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
pub struct WriteableUvw {
    uvw: Locked<UserVaultWrapper>,
    scoped_user_id: ScopedUserId,
}

/// Allow calling any Uvw functions from WriteableUvw
impl std::ops::Deref for WriteableUvw {
    type Target = UserVaultWrapper;

    fn deref(&self) -> &Self::Target {
        &self.uvw
    }
}

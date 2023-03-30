use newtypes::{Locked, ScopedVaultId};

use super::VaultWrapper;
use derive_more::Deref;

mod add_data;
mod build;
mod portablize_data;
mod validated_data_request;

pub use add_data::encrypt_to_s3;
/// This specific subset variant of VaultWrapper contains all the logic to write new data into a user's vault.
/// It can only be constructed via a ScopedVaultId.
///
/// Context:
///
/// VaultWrapper is a rather powerful structure since it is the gate keeper to viewing a user's vault AND to updating the vault.
/// Therefore it's important we do not read or write stale data (unless we want to for some reason explicitly).
///
/// Consider an update of vaulted data:
///    Previously, we'd keep track of whether a UVW was locked by 1) locking rows in Postgres and 2) setting `UVW.is_locked = true`.
///    
///    The situation we are guarding against is an in-memory UVW object being returned from a closure and then, somewhere else, entering another _different_
///    DB transaction and writing stale data.
///
/// Since LockedVaultWrapper is not Sync/Send, we know that it cannot enter multiple threads at once AND (more importantly) it cannot be returned from a closure, leading
/// to us using the stale data.
#[derive(Deref)]
pub struct WriteableVw<Type> {
    #[deref]
    uvw: Locked<VaultWrapper<Type>>,
    scoped_vault_id: ScopedVaultId,
}

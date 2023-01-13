use std::marker::PhantomData;

pub use accessors::*;
use db::models::user_vault::UserVault;
use newtypes::{DataLifetimeSeqno, Locked, ScopedUserId};

use self::uvw_data::UvwData;

pub mod checks;
pub mod identity_document;

mod accessors;
mod add_data;
mod args;
mod build;
mod commit_data;
mod decrypt;
mod decrypt_request;
mod uvd_builder;
mod uvw_data;

pub use add_data::UvwAddData;
pub use args::UvwArgs;
pub use commit_data::UvwCommitData;
pub use decrypt_request::DecryptRequest;

/// UserVaultWrapper represents the current "state" of the UserVault - the most up to date and complete information we have
/// about a particular user.
///
/// In other words, the UserVault is a major dividing line in Footprint's product.
///    1. the API routes and backend logic determine `OnboardingRequirements` that the frontend knows how to collect.
///    2. The information collected is stashed in various tables (see the impls below for the actual locations)
///    3. The decision engine and verification logic _only knows about what's in the UserVault_
///         * it is the information we send to vendors (a UVW gets "serialized" in a `VerificationRequest` in the decision engine)
///         * it is the source of truth to know what we datums we have collected from a User
#[derive(Debug, Clone)]
pub struct UserVaultWrapper {
    pub user_vault: UserVault,
    speculative: UvwData,
    committed: UvwData,
    // The seqno used to reconstruct the UVW. If None, constructed with the latest view of the world.
    _seqno: Option<DataLifetimeSeqno>,
    // Represents whether we have fetched the appropriate data
    is_hydrated: PhantomData<()>,
}

/// Constructed for a specific tenant's view of the world. A tenant is able to see its own uncommitted
/// data on the user vault
pub struct TenantUvw {
    uvw: UserVaultWrapper,
    scoped_user_id: ScopedUserId,
}

/// You should be able to call all UVW functions with an ObUserVaultWrapper
impl std::ops::Deref for TenantUvw {
    type Target = UserVaultWrapper;

    fn deref(&self) -> &Self::Target {
        &self.uvw
    }
}

impl TenantUvw {
    // Decompose the ObUserVaultWrapper into its parts
    pub fn into_inner(self) -> (UserVaultWrapper, ScopedUserId) {
        (self.uvw, self.scoped_user_id)
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

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

use std::marker::PhantomData;

pub use accessors::*;
use db::models::user_vault::UserVault;
use newtypes::DataLifetimeSeqno;

use self::uvw_data::UvwData;

mod accessors;
mod args;
mod build;
mod decrypt;
mod tenant;
mod uvw_data;
mod writeable;

pub use args::UvwArgs;
pub use tenant::*;
pub use writeable::*;

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

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

#[allow(unused_imports)]
pub use accessors::*;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::vault::Vault;
use db::models::vault_data::VaultData as DbVaultData;
use db::HasLifetime;
use newtypes::{
    DataIdentifier,
    DataLifetimeSeqno,
};
use std::collections::HashMap;
use std::marker::PhantomData;

mod accessors;
mod args;
mod build;
mod create;
mod decrypt;
mod portable_view;
mod tenant;
mod writeable;

pub use args::VwArgs;
pub use create::*;
pub use decrypt::*;
pub use tenant::*;
pub use writeable::*;

#[derive(Debug, Clone)]
pub struct Person;
#[derive(Debug, Clone)]
pub struct Business;
#[derive(Debug, Clone)]
pub struct Any;
/// VaultWrapper represents the current "state" of the UserVault - the most up to date and complete
/// information we have about a particular user.
///
/// In other words, the UserVault is a major dividing line in Footprint's product.
///    1. the API routes and backend logic determine `OnboardingRequirements` that the frontend
///       knows how to collect.
///    2. The information collected is stashed in various tables (see the impls below for the actual
///       locations)
///    3. The decision engine and verification logic _only knows about what's in the UserVault_
///         * it is the information we send to vendors (a UVW gets "serialized" in a
///           `VerificationRequest` in the decision engine)
///         * it is the source of truth to know what we datums we have collected from a User
#[derive(Debug, Clone)]
pub struct VaultWrapper<Type = Any> {
    pub vault: Vault,
    /// All VaultDatas for each DataIdentifier.
    /// When there are multiple VaultDatas for one DI, the most recent VaultData comes first.
    /// Generally should use the .data() util instead of accessing this directly
    all_data: HashMap<DataIdentifier, Vec<VaultData>>,
    /// The seqno used to reconstruct the UVW. May be the latest seqno if we're not constructing
    /// a historical view.
    _seqno: DataLifetimeSeqno,
    /// Represents whether we have fetched the appropriate data
    is_hydrated: PhantomData<Type>,
}

impl<Type> VaultWrapper<Type> {
    /// Get the most recent piece of data for the provided DI
    fn data(&self, di: &DataIdentifier) -> Option<&VaultData> {
        self.all_data.get(di).and_then(|d| d.first())
    }
}

#[derive(Debug, Clone)]
struct VaultData {
    pub lifetime: DataLifetime,
    pub data: PieceOfData,
}

impl VaultData {
    /// Shorthand to determine if a piece of data is portable
    pub fn is_portable(&self) -> bool {
        self.lifetime.portablized_seqno.is_some()
    }

    /// Shorthand to determine if a piece of data is not portable
    pub fn is_speculative(&self) -> bool {
        !self.is_portable()
    }

    pub fn data(&self) -> &dyn HasLifetime {
        match &self.data {
            PieceOfData::Vd(vd) => vd as &dyn HasLifetime,
            PieceOfData::Document(d) => d as &dyn HasLifetime,
        }
    }

    /// Shorthand to get the DocumentData if this piece of data is a document, else None
    pub fn doc(&self) -> Option<&DocumentData> {
        match &self.data {
            PieceOfData::Vd(_) => None,
            PieceOfData::Document(d) => Some(d),
        }
    }
}

/// This is unnecessary. We have lots of other enums that represent "Some kind of vaulted data."
/// We could probably get rid of this one (or other ones now that we've added this)
#[derive(Debug, Clone)]
pub(super) enum PieceOfData {
    Vd(DbVaultData),
    Document(DocumentData),
}

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;

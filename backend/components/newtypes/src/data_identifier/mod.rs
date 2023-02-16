//! This module contains all of the different ways that we identify data stored inside of a UserVault.
//! It is a little complex, so we describe all of them here:
//!
//! `DataIdentifier`: the top level identitfier of a piece of data. Given a UVW and a `DataIdentifier`,
//! we should be able to locate the underlying piece of data that is requested. `DataIdentifier`s are
//! also used in access events to designate which pieces of data were decrypted.
//! - `IdentityDataKind`: A subset of DataIdentifier that refers to what we colloquially have been calling
//!   "identity data." This is the set of data that shows up on your virtual, Footprint ID card. It is the
//!   set of data that we send to be verified by our KYC data vendors.
//!    - Identity data is stored inside of a handful of different tables. `UvdKind` is a subset of
//!      `IdentityDataKind` that represents data that is stored only in the `UserVaultData` table.
//! - `KvDataKey`: A subset of DataIdentifier that refers to custom, key-value data. A KvDataKey is just
//!    a wrapper around a free-form string.
//! - `IdDocKind` represents the type of an identity document.
//!
//! `DataLifetimeKind` is a tangential identifier. It mostly intersects with the types represented by
//! `DataIdentifier`, but its purpose is more targeted: `DataLifetimeKind` is purely used in the `kind`
//! column of the `DataLifetime` table since all pieces of data are associated with a lifetime.
//!
//! `CollectedData` and `CollectedDataOption` are also tangential - they are used in onboarding
//! configurations to specify the set of dentity data that needs to be collected, and in permissions
//! to represent which pieces of data are allowed to be decrypted/accessed. Each `CollectedData`
//! variant represents a kind of data that can be collected, like Name or Ssn.
//! - Some `CollectedData` variants have multiple configurations of identity data that can be
//!   collected. Those configurations are represented in `CollectedDataOption` - for example, to
//!   collected a `CD::Address`, you could either collected `CDO::PartialAddress` or `CDO::FullAddress`
//! - Some `CollectedDataOption` variants may represent multiple underlying `IdentityDataKind`s -
//!   for example, `CDO::Name` cannot be collected without collecting _both_ `IDK::FirstName` and
//!   `IDK::LastName`.

mod business_data_kind;
mod collected_data;
mod data_lifetime_kind;
mod id_doc_kind;
mod identity_data_kind;
mod uvd_kind;

pub use self::{
    business_data_kind::*, collected_data::*, data_lifetime_kind::*, id_doc_kind::*, identity_data_kind::*,
    uvd_kind::*,
};
use crate::{
    api_schema_helper::string_api_data_type_alias, util::impl_enum_string_diesel, EnumDotNotationError,
    KvDataKey,
};
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::str::FromStr;
use strum_macros::{AsRefStr, EnumDiscriminants};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    Clone,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    EnumDiscriminants,
    SerializeDisplay,
    DeserializeFromStr,
    JsonSchema,
)]
#[strum_discriminants(derive(strum_macros::EnumString), strum(serialize_all = "snake_case"))]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
/// Represents a piece of data stored inside the user vault.
/// Mostly used in requests to decrypt a piece of data and in access events to show the log of
/// decrypted items.
pub enum DataIdentifier {
    Id(IdentityDataKind),
    Custom(KvDataKey),
    IdDocument(IdDocKind),
    Selfie(IdDocKind),
    Business(BusinessDataKind),
}

string_api_data_type_alias!(DataIdentifier);

impl From<IdentityDataKind> for DataIdentifier {
    fn from(value: IdentityDataKind) -> Self {
        Self::Id(value)
    }
}

impl From<KvDataKey> for DataIdentifier {
    fn from(value: KvDataKey) -> Self {
        Self::Custom(value)
    }
}

/// A custom implementation to make the appearance of serialized DataIdentifiers much more reasonable.
/// We serialize DIs as `prefix.suffix`
impl std::fmt::Display for DataIdentifier {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            Self::Id(s) => s.to_string(),
            Self::Custom(s) => s.to_string(),
            Self::IdDocument(s) => s.to_string(),
            Self::Selfie(s) => s.to_string(),
            Self::Business(s) => s.to_string(),
        };
        write!(f, "{}.{}", prefix, suffix)
    }
}

/// A custom implementation to make the appearance of serialized DataIdentifiers much more reasonable.
/// We serialize DIs as `prefix.suffix`
impl FromStr for DataIdentifier {
    type Err = EnumDotNotationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let period_idx = s
            .find('.')
            .ok_or_else(|| EnumDotNotationError::CannotParse(s.to_owned()))?;
        let prefix = &s[..period_idx];
        let suffix = &s[(period_idx + 1)..];
        let prefix = DataIdentifierDiscriminants::from_str(prefix)
            .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;
        // Parse the suffix differently depending on the prefix
        let cannot_parse_suffix_err = EnumDotNotationError::CannotParseSuffix(suffix.to_owned());
        let result = match prefix {
            DataIdentifierDiscriminants::Id => {
                Self::Id(IdentityDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminants::Custom => {
                Self::Custom(KvDataKey::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminants::IdDocument => {
                Self::IdDocument(IdDocKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminants::Selfie => {
                Self::Selfie(IdDocKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminants::Business => {
                Self::Business(BusinessDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
        };
        Ok(result)
    }
}

impl_enum_string_diesel!(DataIdentifier);

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(DataIdentifier::Id(IdentityDataKind::PhoneNumber) => "id.phone_number")]
    #[test_case(DataIdentifier::Id(IdentityDataKind::Email) => "id.email")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())) => "custom.flerp")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())) => "custom.hello.today.there.")]
    #[test_case(DataIdentifier::IdDocument(IdDocKind::IdCard) => "id_document.id_card")]
    #[test_case(DataIdentifier::Selfie(IdDocKind::IdCard) => "selfie.id_card")]
    #[test_case(DataIdentifier::Business(BusinessDataKind::Ein) => "business.ein")]
    #[test_case(DataIdentifier::Business(BusinessDataKind::AddressLine2) => "business.address_line2")]
    fn test_to_string(identifier: DataIdentifier) -> String {
        identifier.to_string()
    }

    #[test_case("id.phone_number" => DataIdentifier::Id(IdentityDataKind::PhoneNumber))]
    #[test_case("id.email" => DataIdentifier::Id(IdentityDataKind::Email))]
    #[test_case("custom.flerp" => DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())))]
    #[test_case("custom.hello.today.there." => DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())))]
    #[test_case("custom." => DataIdentifier::Custom(KvDataKey::escape_hatch("".to_owned())))]
    #[test_case("id_document.driver_license" => DataIdentifier::IdDocument(IdDocKind::DriverLicense))]
    #[test_case("selfie.passport" => DataIdentifier::Selfie(IdDocKind::Passport))]
    #[test_case("business.ein" => DataIdentifier::Business(BusinessDataKind::Ein))]
    #[test_case("business.phone_number" => DataIdentifier::Business(BusinessDataKind::PhoneNumber))]
    fn test_from_str(input: &str) -> DataIdentifier {
        DataIdentifier::from_str(input).unwrap()
    }
}

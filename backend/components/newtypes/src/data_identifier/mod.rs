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
//! - `IdDocumentKind` represents the type of an identity document.
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

mod collected_data;
mod data_lifetime_kind;
mod id_doc_kind;
mod identity_data_kind;
mod uvd_kind;

pub use self::{
    collected_data::*, data_lifetime_kind::*, id_doc_kind::*, identity_data_kind::*, uvd_kind::*,
};

use std::str::FromStr;

pub use derive_more::Display;
use diesel::{pg::Pg, sql_types::Text, AsExpression, FromSqlRow};
use strum_macros::{AsRefStr, EnumDiscriminants};
use thiserror::Error;

use crate::{api_schema_helper::string_api_data_type_alias, util::impl_enum_string_diesel, KvDataKey};

#[derive(
    Debug, Eq, PartialEq, Ord, PartialOrd, Hash, Clone, AsExpression, FromSqlRow, AsRefStr, EnumDiscriminants,
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
    IdDocument,
    Selfie,
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

#[derive(Debug, Clone, Error)]
pub enum DataIdentifierParsingError {
    #[error("Cannot parse: {0}")]
    CannotParse(String),
    #[error("Cannot parse prefix: {0}")]
    CannotParsePrefix(String),
    #[error("Cannot parse suffix: {0}")]
    CannotParseSuffix(String),
}

impl std::fmt::Display for DataIdentifier {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            Self::Id(s) => Some(s.to_string()),
            Self::Custom(s) => Some(s.to_string()),
            Self::IdDocument => None,
            Self::Selfie => None,
        };
        if let Some(suffix) = suffix {
            write!(f, "{}.{}", prefix, suffix)
        } else {
            write!(f, "{}", prefix)
        }
    }
}

impl FromStr for DataIdentifier {
    type Err = DataIdentifierParsingError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let (prefix, suffix) = if let Some(period_idx) = s.find('.') {
            let prefix = &s[..period_idx];
            let suffix = &s[(period_idx + 1)..];
            (prefix, suffix)
        } else {
            (s, "")
        };
        let prefix = DataIdentifierDiscriminants::from_str(prefix)
            .map_err(|_| DataIdentifierParsingError::CannotParsePrefix(prefix.to_owned()))?;
        // Parse the suffix differently depending on the prefix
        let result = match prefix {
            DataIdentifierDiscriminants::Id => Self::Id(
                IdentityDataKind::from_str(suffix)
                    .map_err(|_| DataIdentifierParsingError::CannotParseSuffix(suffix.to_owned()))?,
            ),
            DataIdentifierDiscriminants::Custom => Self::Custom(
                KvDataKey::from_str(suffix)
                    .map_err(|_| DataIdentifierParsingError::CannotParseSuffix(suffix.to_owned()))?,
            ),
            DataIdentifierDiscriminants::IdDocument => Self::IdDocument,
            DataIdentifierDiscriminants::Selfie => Self::Selfie,
        };
        Ok(result)
    }
}

impl<'de> serde::Deserialize<'de> for DataIdentifier {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl serde::Serialize for DataIdentifier {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.collect_str(self)
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
    #[test_case(DataIdentifier::IdDocument => "id_document")]
    #[test_case(DataIdentifier::Selfie => "selfie")]
    fn test_to_string(identifier: DataIdentifier) -> String {
        identifier.to_string()
    }

    #[test_case("id.phone_number" => DataIdentifier::Id(IdentityDataKind::PhoneNumber))]
    #[test_case("id.email" => DataIdentifier::Id(IdentityDataKind::Email))]
    #[test_case("custom.flerp" => DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())))]
    #[test_case("custom.hello.today.there." => DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())))]
    #[test_case("custom." => DataIdentifier::Custom(KvDataKey::escape_hatch("".to_owned())))]
    #[test_case("id_document" => DataIdentifier::IdDocument)]
    #[test_case("selfie" => DataIdentifier::Selfie)]
    fn test_from_str(input: &str) -> DataIdentifier {
        DataIdentifier::from_str(input).unwrap()
    }
}

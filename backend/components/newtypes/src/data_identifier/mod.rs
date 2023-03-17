//! This module contains all of the different ways that we identify data stored inside of a UserVault.
//! It is a little complex, so we describe all of them here:
//!
//! `DataIdentifier`: the top level identitfier of a piece of data. Given a UVW and a `DataIdentifier`,
//! we should be able to locate the underlying piece of data that is requested. `DataIdentifier`s are
//! also used in access events to designate which pieces of data were decrypted.
//! - `IdentityDataKind`: A subset of DataIdentifier that refers to what we colloquially have been calling
//!   "identity data." This is the set of data that shows up on your virtual, Footprint ID card. It is the
//!   set of data that we send to be verified by our KYC data vendors.
//!    - TODO need to update this
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
mod document_kind;
mod id_doc_kind;
mod identity_data_kind;
mod investor_profile_kind;
mod kv_data_key;
mod validation;
mod vd_kind;

pub use self::{
    business_data_kind::*, collected_data::*, data_lifetime_kind::*, document_kind::*, id_doc_kind::*,
    identity_data_kind::*, investor_profile_kind::*, validation::Error as ValidationError, validation::*,
    vd_kind::*,
};
use crate::{
    api_schema_helper::string_api_data_type_alias, util::impl_enum_string_diesel, EnumDotNotationError,
    KvDataKey,
};
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::hash::Hash;
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
#[strum_discriminants(
    name(DataIdentifierDiscriminant),
    vis(pub),
    derive(strum_macros::EnumString),
    strum(serialize_all = "snake_case")
)]
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
    InvestorProfile(InvestorProfileKind),
    Document(DocumentKind),
}

string_api_data_type_alias!(DataIdentifier);

/// Contains all of the functionality that each nested type of DataIdentifier must provide
pub trait IsDataIdentifierDiscriminant:
    Hash + Eq + Clone + TryFrom<DataIdentifier> + Into<DataIdentifier> + Validate
{
    /// When true, will not be required in order to satisfy the parent CD/CDO
    fn is_optional(&self) -> bool;

    /// Maps the DI variant to the CollectedData variant that contains this DI
    fn parent(&self) -> Option<CollectedData>;
}

impl DataIdentifier {
    /// When true, will not be required in order to satisfy the parent CD/CDO
    fn is_optional(&self) -> bool {
        match self {
            Self::Id(s) => s.is_optional(),
            Self::Custom(s) => s.is_optional(),
            Self::Business(s) => s.is_optional(),
            Self::InvestorProfile(s) => s.is_optional(),
            Self::Document(s) => s.is_optional(),
            // TODO
            Self::IdDocument(_) | Self::Selfie(_) => false,
        }
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
            Self::InvestorProfile(s) => s.to_string(),
            Self::Document(s) => s.to_string(),
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
        let prefix = DataIdentifierDiscriminant::from_str(prefix)
            .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;
        // Parse the suffix differently depending on the prefix
        let cannot_parse_suffix_err = EnumDotNotationError::CannotParseSuffix(suffix.to_owned());
        let result = match prefix {
            DataIdentifierDiscriminant::Id => {
                Self::Id(IdentityDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminant::Custom => {
                Self::Custom(KvDataKey::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminant::IdDocument => {
                Self::IdDocument(IdDocKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminant::Selfie => {
                Self::Selfie(IdDocKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminant::Business => {
                Self::Business(BusinessDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminant::InvestorProfile => Self::InvestorProfile(
                InvestorProfileKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?,
            ),
            DataIdentifierDiscriminant::Document => {
                Self::Document(DocumentKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
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
    #[test_case(DataIdentifier::Document(DocumentKind::FinraComplianceLetter) => "document.finra_compliance_letter")]
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
    #[test_case("document.finra_compliance_letter" => DataIdentifier::Document(DocumentKind::FinraComplianceLetter))]
    fn test_from_str(input: &str) -> DataIdentifier {
        DataIdentifier::from_str(input).unwrap()
    }
}

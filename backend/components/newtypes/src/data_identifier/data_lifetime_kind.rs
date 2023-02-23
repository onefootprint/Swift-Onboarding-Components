use crate::{BusinessDataKind, EnumDotNotationError, IdDocKind, IdentityDataKind, KvDataKey};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::str::FromStr;
use strum::EnumDiscriminants;
use strum_macros::AsRefStr;

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
)]
#[strum_discriminants(derive(strum_macros::EnumString), strum(serialize_all = "snake_case"))]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
/// The kind of a `DataLifetime` row. This looks very similar to `DataIdentifier` because nearly
/// every piece of data identified by `DataIdentifier` has a `DataLifetime` row associated with it
/// NOTE: don't merge this with DataIdentifier yet. It may drift more from DataIdentifier, like if
/// we have a separate DLK for non-primary phone numbers and emails.
pub enum DataLifetimeKind {
    Id(IdentityDataKind),
    Custom(KvDataKey),
    IdDocument(IdDocKind),
    Business(BusinessDataKind),
}

crate::util::impl_enum_string_diesel!(DataLifetimeKind);

impl From<IdentityDataKind> for DataLifetimeKind {
    fn from(value: IdentityDataKind) -> Self {
        Self::Id(value)
    }
}

impl From<KvDataKey> for DataLifetimeKind {
    fn from(value: KvDataKey) -> Self {
        Self::Custom(value)
    }
}

impl From<IdDocKind> for DataLifetimeKind {
    fn from(value: IdDocKind) -> Self {
        Self::IdDocument(value)
    }
}

impl From<BusinessDataKind> for DataLifetimeKind {
    fn from(value: BusinessDataKind) -> Self {
        Self::Business(value)
    }
}

/// A custom implementation to make the appearance of serialized DataLifetimeKind much more reasonable.
/// We serialize DLKs as `prefix.suffix`
impl std::fmt::Display for DataLifetimeKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            Self::Id(s) => s.to_string(),
            Self::Custom(s) => s.to_string(),
            Self::IdDocument(s) => s.to_string(),
            Self::Business(s) => s.to_string(),
        };
        write!(f, "{}.{}", prefix, suffix)
    }
}

/// A custom implementation to make the appearance of serialized DataLifetimeKind much more reasonable.
/// We serialize DLKs as `prefix.suffix`
impl FromStr for DataLifetimeKind {
    type Err = EnumDotNotationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let period_idx = s
            .find('.')
            .ok_or_else(|| EnumDotNotationError::CannotParse(s.to_owned()))?;
        let prefix = &s[..period_idx];
        let suffix = &s[(period_idx + 1)..];
        let prefix = DataLifetimeKindDiscriminants::from_str(prefix)
            .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;
        // Parse the suffix differently depending on the prefix
        let cannot_parse_suffix_err = EnumDotNotationError::CannotParseSuffix(suffix.to_owned());
        let result = match prefix {
            DataLifetimeKindDiscriminants::Id => {
                Self::Id(IdentityDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataLifetimeKindDiscriminants::Custom => {
                Self::Custom(KvDataKey::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataLifetimeKindDiscriminants::IdDocument => {
                Self::IdDocument(IdDocKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataLifetimeKindDiscriminants::Business => {
                Self::Business(BusinessDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
        };
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(DataLifetimeKind::Id(IdentityDataKind::PhoneNumber) => "id.phone_number")]
    #[test_case(DataLifetimeKind::Id(IdentityDataKind::Email) => "id.email")]
    #[test_case(DataLifetimeKind::Custom(KvDataKey::escape_hatch("flerp".to_owned())) => "custom.flerp")]
    #[test_case(DataLifetimeKind::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())) => "custom.hello.today.there.")]
    #[test_case(DataLifetimeKind::IdDocument(IdDocKind::IdCard) => "id_document.id_card")]
    #[test_case(DataLifetimeKind::Business(BusinessDataKind::AddressLine1) => "business.address_line1")]
    #[test_case(DataLifetimeKind::Business(BusinessDataKind::Website) => "business.website")]
    fn test_to_string(identifier: DataLifetimeKind) -> String {
        identifier.to_string()
    }

    #[test_case("id.phone_number" => DataLifetimeKind::Id(IdentityDataKind::PhoneNumber))]
    #[test_case("id.email" => DataLifetimeKind::Id(IdentityDataKind::Email))]
    #[test_case("custom.flerp" => DataLifetimeKind::Custom(KvDataKey::escape_hatch("flerp".to_owned())))]
    #[test_case("custom.hello.today.there." => DataLifetimeKind::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())))]
    #[test_case("custom." => DataLifetimeKind::Custom(KvDataKey::escape_hatch("".to_owned())))]
    #[test_case("id_document.driver_license" => DataLifetimeKind::IdDocument(IdDocKind::DriverLicense))]
    #[test_case("business.address_line1" => DataLifetimeKind::Business(BusinessDataKind::AddressLine1))]
    #[test_case("business.website" => DataLifetimeKind::Business(BusinessDataKind::Website))]
    fn test_from_str(input: &str) -> DataLifetimeKind {
        DataLifetimeKind::from_str(input).unwrap()
    }
}

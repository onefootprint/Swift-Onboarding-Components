use crate::{BusinessDataKind, ConversionError, DataIdentifier, IdDocKind, IdentityDataKind, KvDataKey};
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

impl From<DataLifetimeKind> for DataIdentifier {
    fn from(value: DataLifetimeKind) -> Self {
        match value {
            DataLifetimeKind::Business(b) => Self::Business(b),
            DataLifetimeKind::Id(b) => Self::Id(b),
            DataLifetimeKind::Custom(k) => Self::Custom(k),
            DataLifetimeKind::IdDocument(k) => Self::IdDocument(k),
        }
    }
}

impl TryFrom<DataIdentifier> for DataLifetimeKind {
    type Error = ConversionError;

    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Business(b) => Ok(Self::Business(b)),
            DataIdentifier::Id(b) => Ok(Self::Id(b)),
            DataIdentifier::Custom(k) => Ok(Self::Custom(k)),
            DataIdentifier::IdDocument(k) => Ok(Self::IdDocument(k)),
            _ => Err(ConversionError::Error(value)),
        }
    }
}

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
        let di = DataIdentifier::from(self.clone());
        di.fmt(f)
    }
}

/// A custom implementation to make the appearance of serialized DataLifetimeKind much more reasonable.
/// We serialize DLKs as `prefix.suffix`
impl FromStr for DataLifetimeKind {
    type Err = crate::Error;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let di = DataIdentifier::from_str(s)?;
        let result = Self::try_from(di)?;
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

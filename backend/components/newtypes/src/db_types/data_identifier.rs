use std::str::FromStr;

pub use derive_more::Display;
use diesel::{pg::Pg, sql_types::Text, AsExpression, FromSqlRow};
use strum_macros::{AsRefStr, EnumDiscriminants};
use thiserror::Error;

use crate::{
    api_schema_helper::string_api_data_type_alias, util::impl_enum_string_diesel, IdentityDataKind, KvDataKey,
};

/// Identifies a piece of data for a user vault
#[derive(
    Debug, Eq, PartialEq, Ord, PartialOrd, Hash, Clone, AsExpression, FromSqlRow, AsRefStr, EnumDiscriminants,
)]
#[strum_discriminants(derive(strum_macros::EnumString), strum(serialize_all = "snake_case"))]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DataIdentifier {
    Id(IdentityDataKind),
    Custom(KvDataKey),
    IdDocument,
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

#[derive(Debug, Error)]
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
    fn test_to_string(identifier: DataIdentifier) -> String {
        identifier.to_string()
    }

    #[test_case("id.phone_number" => DataIdentifier::Id(IdentityDataKind::PhoneNumber))]
    #[test_case("id.email" => DataIdentifier::Id(IdentityDataKind::Email))]
    #[test_case("custom.flerp" => DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())))]
    #[test_case("custom.hello.today.there." => DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())))]
    #[test_case("custom." => DataIdentifier::Custom(KvDataKey::escape_hatch("".to_owned())))]
    #[test_case("id_document" => DataIdentifier::IdDocument)]
    fn test_from_str(input: &str) -> DataIdentifier {
        DataIdentifier::from_str(input).unwrap()
    }
}

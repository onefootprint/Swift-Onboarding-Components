use std::str::FromStr;

pub use derive_more::Display;
use diesel::{pg::Pg, sql_types::Text, AsExpression, FromSqlRow};
use strum_macros::{AsRefStr, EnumDiscriminants};
use thiserror::Error;

use crate::{
    api_schema_helper::string_api_data_type_alias, util::impl_enum_string_diesel, DataLifetimeKind, KvDataKey,
};

/// Identifies a piece of data for a user vault
#[derive(
    Debug, Eq, PartialEq, Ord, PartialOrd, Hash, Clone, AsExpression, FromSqlRow, AsRefStr, EnumDiscriminants,
)]
#[strum_discriminants(derive(strum_macros::EnumString), strum(serialize_all = "snake_case"))]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DataIdentifier {
    Identity(DataLifetimeKind),
    Custom(KvDataKey),
}

string_api_data_type_alias!(DataIdentifier);

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
            Self::Identity(s) => s.to_string(),
            Self::Custom(s) => s.to_string(),
        };
        write!(f, "{}.{}", prefix, suffix)
    }
}

impl FromStr for DataIdentifier {
    type Err = DataIdentifierParsingError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let idx = s.find('.').ok_or_else(|| DataIdentifierParsingError::CannotParse(s.to_owned()))?;
        let prefix = &s[..idx];
        let suffix = &s[(idx + 1)..];
        let prefix = DataIdentifierDiscriminants::from_str(prefix)
            .map_err(|_| DataIdentifierParsingError::CannotParsePrefix(prefix.to_owned()))?;
        let result = match prefix {
            DataIdentifierDiscriminants::Identity => Self::Identity(
                DataLifetimeKind::from_str(suffix)
                    .map_err(|_| DataIdentifierParsingError::CannotParseSuffix(suffix.to_owned()))?,
            ),
            DataIdentifierDiscriminants::Custom => Self::Custom(
                KvDataKey::from_str(suffix).map_err(|_| DataIdentifierParsingError::CannotParseSuffix(suffix.to_owned()))?,
            ),
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

impl DataIdentifier {
    pub fn list(attributes: Vec<DataLifetimeKind>) -> Vec<Self> {
        attributes.into_iter().map(Self::Identity).collect()
    }
}

impl_enum_string_diesel!(DataIdentifier);

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(DataIdentifier::Identity(DataLifetimeKind::PhoneNumber) => "identity.phone_number")]
    #[test_case(DataIdentifier::Identity(DataLifetimeKind::Email) => "identity.email")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())) => "custom.flerp")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())) => "custom.hello.today.there.")]
    fn test_to_string(identifier: DataIdentifier) -> String {
        identifier.to_string()
    }

    #[test_case("identity.phone_number" => DataIdentifier::Identity(DataLifetimeKind::PhoneNumber))]
    #[test_case("identity.email" => DataIdentifier::Identity(DataLifetimeKind::Email))]
    #[test_case("custom.flerp" => DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())))]
    #[test_case("custom.hello.today.there." => DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())))]
    #[test_case("custom." => DataIdentifier::Custom(KvDataKey::escape_hatch("".to_owned())))]
    fn test_from_str(input: &str) -> DataIdentifier {
        DataIdentifier::from_str(input).unwrap()
    }
}

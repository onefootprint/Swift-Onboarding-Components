use std::str::FromStr;

use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{AsRefStr, Display, EnumDiscriminants, EnumIter, EnumString};

use crate::{BusinessDataKind, DataLifetimeKind, EnumDotNotationError, IdentityDataKind};

#[derive(
    Debug,
    Clone,
    Copy,
    Ord,
    PartialOrd,
    Eq,
    Hash,
    PartialEq,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    EnumDiscriminants,
    SerializeDisplay,
    DeserializeFromStr,
)]
#[strum_discriminants(derive(EnumString), strum(serialize_all = "snake_case"))]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum UvdKind {
    Id(PersonVaultDataKind),
    Business(BusinessDataKind),
}

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Apiv2Schema,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    Hash,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    JsonSchema,
    Deserialize,
    Serialize,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum PersonVaultDataKind {
    FirstName,
    LastName,
    Dob,
    Ssn4,
    Ssn9,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
}

impl From<PersonVaultDataKind> for UvdKind {
    fn from(value: PersonVaultDataKind) -> Self {
        UvdKind::Id(value)
    }
}

impl From<BusinessDataKind> for UvdKind {
    fn from(value: BusinessDataKind) -> Self {
        UvdKind::Business(value)
    }
}

impl From<PersonVaultDataKind> for IdentityDataKind {
    fn from(value: PersonVaultDataKind) -> Self {
        match value {
            PersonVaultDataKind::FirstName => Self::FirstName,
            PersonVaultDataKind::LastName => Self::LastName,
            PersonVaultDataKind::Dob => Self::Dob,
            PersonVaultDataKind::Ssn4 => Self::Ssn4,
            PersonVaultDataKind::Ssn9 => Self::Ssn9,
            PersonVaultDataKind::AddressLine1 => Self::AddressLine1,
            PersonVaultDataKind::AddressLine2 => Self::AddressLine2,
            PersonVaultDataKind::City => Self::City,
            PersonVaultDataKind::State => Self::State,
            PersonVaultDataKind::Zip => Self::Zip,
            PersonVaultDataKind::Country => Self::Country,
        }
    }
}

impl From<PersonVaultDataKind> for DataLifetimeKind {
    fn from(value: PersonVaultDataKind) -> Self {
        IdentityDataKind::from(value).into()
    }
}

#[derive(Debug, thiserror::Error)]
pub enum UvdKindConversionError {
    #[error("Cannot convert from UvdKind: {0} to IdentityDataKind")]
    ToIdentityDataKindError(UvdKind),
}

// For now, we effectively only have PersonVaultDataKind in UserVault and this maps to IDK. But we are paving the way for BusinessDataKind to be in UserVault as well and this does not
// map to IDK. In some places in the current UserVaultWrapper/UvdBuilder/UserVault, we rely on UvdKind<>IDK interop so for now we will use this TryFrom to continue to support this.
// In a follow, we'll make a seperate BusinessVaultWrapper and then have these two seperate wrappers depend on PersonVaultDataKind + BusinessDataKind and this can be removed
impl TryFrom<UvdKind> for IdentityDataKind {
    type Error = UvdKindConversionError;

    fn try_from(value: UvdKind) -> Result<Self, Self::Error> {
        match value {
            UvdKind::Id(p) => Ok(p.into()),
            UvdKind::Business(_) => Err(UvdKindConversionError::ToIdentityDataKindError(value)),
        }
    }
}

impl std::fmt::Display for UvdKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            UvdKind::Id(s) => s.to_string(),
            UvdKind::Business(s) => s.to_string(),
        };
        write!(f, "{}.{}", prefix, suffix)
    }
}

impl FromStr for UvdKind {
    type Err = EnumDotNotationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let period_idx = s.find('.');

        // We are bifurcating UvdKind from a flat enum into an enum with 2 struct-nested variants (PersonVaultDataKind, BusinessDataKind).
        // We currently only have the person variants and these are being serialized into PG as non-prefixed strings (eg: first_name, dob) but these will now be written as
        // prefixed strings (eg: person.first_name, person.dob). To maintain backwards compatability for a brief period before a database migration is run in a followup, we will
        // handle here both parsing prefixed and non-prefixed person variants.
        let result = match period_idx {
            None => PersonVaultDataKind::from_str(s)
                .map(Self::Id)
                .map_err(|_| EnumDotNotationError::CannotParse(s.to_owned()))?,
            Some(period_idx) => {
                let prefix = &s[..period_idx];
                let suffix = &s[(period_idx + 1)..];
                let prefix = UvdKindDiscriminants::from_str(prefix)
                    .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;

                let cannot_parse_suffix_err = EnumDotNotationError::CannotParseSuffix(suffix.to_owned());
                match prefix {
                    UvdKindDiscriminants::Id => {
                        Self::Id(PersonVaultDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
                    }
                    UvdKindDiscriminants::Business => Self::Business(
                        BusinessDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?,
                    ),
                }
            }
        };

        Ok(result)
    }
}

crate::util::impl_enum_string_diesel!(PersonVaultDataKind);
crate::util::impl_enum_string_diesel!(BusinessDataKind);
crate::util::impl_enum_string_diesel!(UvdKind);

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case(UvdKind::Id(PersonVaultDataKind::FirstName) => "id.first_name")]
    #[test_case(UvdKind::Id(PersonVaultDataKind::AddressLine1) => "id.address_line1")]
    fn test_serialization(kind: UvdKind) -> String {
        kind.to_string()
    }

    #[test_case("id.first_name" => UvdKind::Id(PersonVaultDataKind::FirstName))]
    #[test_case("first_name" => UvdKind::Id(PersonVaultDataKind::FirstName))]
    #[test_case("id.address_line1" => UvdKind::Id(PersonVaultDataKind::AddressLine1))]
    #[test_case("address_line1" => UvdKind::Id(PersonVaultDataKind::AddressLine1))]
    fn test_deserialization(input: &str) -> UvdKind {
        UvdKind::from_str(input).unwrap()
    }
}

use std::str::FromStr;

use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{AsRefStr, EnumDiscriminants, EnumString};

use crate::{BusinessDataKind as BDK, DataIdentifier, EnumDotNotationError, IdentityDataKind as IDK};

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
#[strum_discriminants(
    name(VdKindDiscriminant),
    derive(EnumString),
    strum(serialize_all = "snake_case")
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum VdKind {
    // We use IDK here, even though Email and PhoneNumber variants of IDK are never stored in the
    // VaultData table. We will likely migrate Email and PhoneNumber to go in VaultData in the future.
    Id(IDK),
    Business(BDK),
}

crate::util::impl_enum_string_diesel!(VdKind);
crate::util::impl_enum_string_diesel!(BDK);

impl From<VdKind> for DataIdentifier {
    fn from(value: VdKind) -> Self {
        match value {
            VdKind::Business(b) => Self::Business(b),
            VdKind::Id(b) => Self::Id(b),
        }
    }
}

impl From<IDK> for VdKind {
    fn from(value: IDK) -> Self {
        Self::Id(value)
    }
}

impl From<BDK> for VdKind {
    fn from(value: BDK) -> Self {
        Self::Business(value)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum VdKindConversionError {
    #[error("Cannot convert from UvdKind: {0} to IDK")]
    ToIdentityDataKindError(VdKind),
}

impl std::fmt::Display for VdKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            VdKind::Id(s) => {
                // Temporarily make sure we don't serialize a phone/email since they aren't stored in the VaultData table
                if matches!(s, IDK::PhoneNumber | IDK::Email) {
                    return Err(std::fmt::Error);
                }
                s.to_string()
            }
            VdKind::Business(s) => s.to_string(),
        };
        write!(f, "{}.{}", prefix, suffix)
    }
}

impl FromStr for VdKind {
    type Err = EnumDotNotationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let period_idx = s.find('.');

        // We are bifurcating UvdKind from a flat enum into an enum with 2 struct-nested variants (IDK, BDK).
        // We currently only have the person variants and these are being serialized into PG as non-prefixed strings (eg: first_name, dob) but these will now be written as
        // prefixed strings (eg: person.first_name, person.dob). To maintain backwards compatability for a brief period before a database migration is run in a followup, we will
        // handle here both parsing prefixed and non-prefixed person variants.
        let result = match period_idx {
            None => IDK::from_str(s)
                .map(Self::Id)
                .map_err(|_| EnumDotNotationError::CannotParse(s.to_owned()))?,
            Some(period_idx) => {
                let prefix = &s[..period_idx];
                let suffix = &s[(period_idx + 1)..];
                let prefix = VdKindDiscriminant::from_str(prefix)
                    .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;

                let cannot_parse_suffix_err = EnumDotNotationError::CannotParseSuffix(suffix.to_owned());
                match prefix {
                    VdKindDiscriminant::Id => {
                        let idk = IDK::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?;
                        // Temporarily make sure we don't parse a phone/email since they aren't stored in the VaultData table
                        if matches!(idk, IDK::PhoneNumber | IDK::Email) {
                            return Err(EnumDotNotationError::CannotParseSuffix(
                                "Cannot use PhoneNumber or Email in VdKind".to_owned(),
                            ));
                        }
                        Self::Id(idk)
                    }
                    VdKindDiscriminant::Business => {
                        Self::Business(BDK::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
                    }
                }
            }
        };

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case(VdKind::Id(IDK::FirstName) => "id.first_name")]
    #[test_case(VdKind::Id(IDK::AddressLine1) => "id.address_line1")]
    fn test_serialization(kind: VdKind) -> String {
        kind.to_string()
    }

    #[test_case("id.first_name" => VdKind::Id(IDK::FirstName))]
    #[test_case("first_name" => VdKind::Id(IDK::FirstName))]
    #[test_case("id.address_line1" => VdKind::Id(IDK::AddressLine1))]
    #[test_case("address_line1" => VdKind::Id(IDK::AddressLine1))]
    fn test_deserialization(input: &str) -> VdKind {
        VdKind::from_str(input).unwrap()
    }

    #[test]
    fn test_no_phone_or_email() {
        assert!(VdKind::from_str("id.phone_number").is_err());
        assert!(VdKind::from_str("id.email").is_err());
    }
}

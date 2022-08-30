pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::{actix::Apiv2Schema, v2::schema::TypedData};
use serde::{Deserialize, Deserializer, Serialize};
use std::str::FromStr;

use crate::pii_helper::newtype_to_pii;

#[doc = "Social security number -- 9 digit or 4 digit numeric string"]
#[derive(Debug, Clone, Hash, PartialEq, Eq, Apiv2Schema)]
pub enum Ssn {
    Ssn9(Ssn9),
    Ssn4(Ssn4),
}

#[doc = "Social security number -- 9 digit numeric string"]
#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default)]
#[serde(transparent)]
/// 9 digit social security number
pub struct Ssn9(String);

impl TypedData for Ssn9 {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }
}

newtype_to_pii!(Ssn9);

#[doc = "Last four digits of ssn -- 4 digit numeric string"]
#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default)]
/// Last four digits of social security number
#[serde(transparent)]
pub struct Ssn4(String);

impl TypedData for Ssn4 {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }
}

newtype_to_pii!(Ssn4);

impl std::str::FromStr for Ssn9 {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // sanitize by removing excess chars + checking length
        let number = s.chars().filter(|char| char.is_ascii_digit()).collect::<String>();
        if number.len() != 9 {
            return Err(crate::Error::InvalidSsn);
        }
        Ok(Ssn9(number))
    }
}

impl From<&Ssn9> for Ssn4 {
    fn from(val: &Ssn9) -> Self {
        let last_four = val.0.chars().skip(val.0.len() - 4).collect();
        Ssn4(last_four)
    }
}

impl<'de> Deserialize<'de> for Ssn9 {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl std::fmt::Debug for Ssn9 {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "*********")
    }
}

impl std::str::FromStr for Ssn4 {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // sanitize by removing excess chars + checking length
        let number = s.chars().filter(|char| char.is_ascii_digit()).collect::<String>();
        if number.len() != 4 {
            return Err(crate::Error::InvalidSsn);
        }
        Ok(Ssn4(number))
    }
}

impl<'de> Deserialize<'de> for Ssn4 {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl std::fmt::Debug for Ssn4 {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "****")
    }
}
#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_ssn() {
        #[derive(Eq, Debug, PartialEq, Serialize, Deserialize)]
        struct Test {
            pub ssn: Ssn9,
        }
        let example = "{\"ssn\": \"123-45-7890\"}";
        let bad_example = "{\"ssn\": \"12345a\"}";

        let deserialized: Test = serde_json::from_str(example).unwrap();
        let ssn = &deserialized.ssn;
        let bad_example: Result<Test, _> = serde_json::from_str(bad_example);
        assert!(bad_example.is_err());
        assert_eq!(
            deserialized,
            Test {
                ssn: Ssn9("123457890".to_owned())
            }
        );

        let test_bad_str = "12345a";
        assert!(Ssn9::from_str(test_bad_str).is_err());

        assert_eq!(format!("{ssn:#?}"), "*********");
    }

    #[test]
    fn test_ssn_last_four() {
        #[derive(Eq, Debug, PartialEq, Serialize, Deserialize)]
        struct Test {
            pub last_four_ssn: Ssn4,
        }
        let example = "{\"last_four_ssn\": \"7890\"}";
        let bad_example = "{\"last_four_ssn\": \"12345a\"}";

        let deserialized: Test = serde_json::from_str(example).unwrap();
        let ssn = &deserialized.last_four_ssn;
        let bad_example: Result<Test, _> = serde_json::from_str(bad_example);
        assert!(bad_example.is_err());
        assert_eq!(
            deserialized,
            Test {
                last_four_ssn: Ssn4("7890".to_owned())
            }
        );

        let test_bad_str = "12345a";
        assert!(Ssn9::from_str(test_bad_str).is_err());

        assert_eq!(format!("{ssn:#?}"), "****")
    }
}

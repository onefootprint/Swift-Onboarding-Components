pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Deserializer, Serialize};
use std::str::FromStr;

#[doc = "Social security number -- 9 digit numeric string"]
#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default, Apiv2Schema)]
#[serde(transparent)]
/// 9 digit social security number
pub struct Ssn(String);

#[doc = "Last four digits of ssn -- 4 digit numeric string"]
#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default, Apiv2Schema)]
/// Last four digits of social security number
#[serde(transparent)]
pub struct LastFourSsn(String);

impl std::str::FromStr for Ssn {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // sanitize by removing excess chars + checking length
        let number = s.chars().filter(|char| char.is_digit(10)).collect::<String>();
        if number.len() != 9 {
            return Err(crate::Error::InvalidSsn);
        }
        Ok(Ssn(number))
    }
}

impl<'de> Deserialize<'de> for Ssn {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl std::fmt::Display for Ssn {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "*********")
    }
}

impl std::fmt::Debug for Ssn {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "*********")
    }
}

impl std::str::FromStr for LastFourSsn {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // sanitize by removing excess chars + checking length
        let number = s.chars().filter(|char| char.is_digit(10)).collect::<String>();
        if number.len() != 4 {
            return Err(crate::Error::InvalidSsn);
        }
        Ok(LastFourSsn(number))
    }
}

impl<'de> Deserialize<'de> for LastFourSsn {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl std::fmt::Display for LastFourSsn {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "****")
    }
}

impl std::fmt::Debug for LastFourSsn {
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
            pub ssn: Ssn,
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
                ssn: Ssn("123457890".to_owned())
            }
        );

        let test_bad_str = "12345a";
        assert!(Ssn::from_str(test_bad_str).is_err());

        assert_eq!(format!("{ssn:#?}"), "*********");
    }

    #[test]
    fn test_ssn_last_four() {
        #[derive(Eq, Debug, PartialEq, Serialize, Deserialize)]
        struct Test {
            pub last_four_ssn: LastFourSsn,
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
                last_four_ssn: LastFourSsn("7890".to_owned())
            }
        );

        let test_bad_str = "12345a";
        assert!(Ssn::from_str(test_bad_str).is_err());

        assert_eq!(format!("{ssn:#?}"), "****")
    }
}

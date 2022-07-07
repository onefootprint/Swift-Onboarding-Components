pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Deserializer, Serialize};
use std::str::FromStr;

use crate::{DataGroupKind, DataKind, Decomposable, PiiString};

#[doc = "Social security number -- 9 digit or 4 digit numeric string"]
#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Apiv2Schema)]
#[serde(untagged)]
/// 9 digit social security number
pub enum Ssn {
    Ssn(FullSsn),
    LastFour(LastFourSsn),
}

impl Decomposable for Ssn {
    fn decompose(&self) -> crate::DecomposedDataKind {
        let list = match self {
            Ssn::Ssn(ssn) => {
                let last_four = LastFourSsn::from(ssn);
                vec![
                    (DataKind::LastFourSsn, PiiString::from(&last_four.0)),
                    (DataKind::Ssn, PiiString::from(&ssn.0)),
                ]
            }
            Ssn::LastFour(last_four) => vec![(DataKind::LastFourSsn, PiiString::from(&last_four.0))],
        };
        crate::DecomposedDataKind {
            data: list,
            group: DataGroupKind::Ssn,
        }
    }
}
#[doc = "Social security number -- 9 digit numeric string"]
#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default, Apiv2Schema)]
#[serde(transparent)]
/// 9 digit social security number
pub struct FullSsn(String);

#[doc = "Last four digits of ssn -- 4 digit numeric string"]
#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default, Apiv2Schema)]
/// Last four digits of social security number
#[serde(transparent)]
pub struct LastFourSsn(String);

impl std::str::FromStr for FullSsn {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // sanitize by removing excess chars + checking length
        let number = s.chars().filter(|char| char.is_ascii_digit()).collect::<String>();
        if number.len() != 9 {
            return Err(crate::Error::InvalidSsn);
        }
        Ok(FullSsn(number))
    }
}

impl From<&FullSsn> for LastFourSsn {
    fn from(val: &FullSsn) -> Self {
        let last_four = val.0.chars().skip(val.0.len() - 4).collect();
        LastFourSsn(last_four)
    }
}

impl<'de> Deserialize<'de> for FullSsn {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl std::fmt::Display for FullSsn {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "*********")
    }
}

impl std::fmt::Debug for FullSsn {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "*********")
    }
}

impl std::str::FromStr for LastFourSsn {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // sanitize by removing excess chars + checking length
        let number = s.chars().filter(|char| char.is_ascii_digit()).collect::<String>();
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
            pub ssn: FullSsn,
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
                ssn: FullSsn("123457890".to_owned())
            }
        );

        let test_bad_str = "12345a";
        assert!(FullSsn::from_str(test_bad_str).is_err());

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
        assert!(FullSsn::from_str(test_bad_str).is_err());

        assert_eq!(format!("{ssn:#?}"), "****")
    }
}

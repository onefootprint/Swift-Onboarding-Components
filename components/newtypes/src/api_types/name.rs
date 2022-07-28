pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Deserializer, Serialize};
use std::fmt::{Debug, Display};
use std::str::FromStr;

use crate::{DataGroupKind, DataKind, Decomposable, NewData, PiiString};

#[doc = "Full Name"]
#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
/// A struct representing first and last name. We uppercase all names for consistency
pub struct FullName {
    first_name: Name,
    last_name: Name,
}

impl Decomposable for FullName {
    fn decompose(self) -> Vec<NewData> {
        NewData::list(
            vec![
                (DataKind::FirstName, PiiString::from(self.first_name.0)),
                (DataKind::LastName, PiiString::from(self.last_name.0)),
            ],
            DataGroupKind::FullName,
        )
    }
}

#[doc = "Name"]
#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default, Apiv2Schema)]
#[serde(transparent)]
/// A string. We uppercase all names for consistency.
pub struct Name(String);

impl FromStr for Name {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // uppercase for consistency / if we ever need to support searching by fingerprint
        Ok(Name(s.to_uppercase()))
    }
}

impl<'de> Deserialize<'de> for Name {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl Display for Name {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "<redacted>")
    }
}

impl Debug for Name {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "<redacted>")
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_name() {
        #[derive(Eq, Debug, PartialEq, Serialize, Deserialize)]
        struct Test {
            pub name: Name,
        }
        let example = "{\"name\": \"boop\"}";

        let deserialized: Test = serde_json::from_str(example).unwrap();
        assert_eq!(
            deserialized,
            Test {
                name: Name("BOOP".to_owned())
            }
        );

        assert_eq!(format!("{:#?}", deserialized.name), "<redacted>");
    }
}

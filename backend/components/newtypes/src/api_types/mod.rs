use serde::{Deserialize, Serialize};
use std::fmt::{Debug, Display};

use self::api_schema_helper::string_api_data_type_alias;
use crate::DataAttribute;

pub mod address;
pub mod csv;
pub mod dob;
pub mod email;
pub mod name;
pub mod onboarding_requirement;
pub mod phone_number;
pub mod sandbox;
pub mod ssn;

/// Represents a string that hides PII
#[derive(Clone, Deserialize, Serialize, Default, PartialEq, Eq, Hash)]
#[serde(transparent)]
pub struct PiiString(String);

/// Like PiiString, but scrubs the serde::Serialize implementation
#[derive(Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
#[serde(transparent)]
pub struct ScrubbedPiiString(#[serde(serialize_with = "scrubbed_str")] PiiString);

fn scrubbed_str<S>(_v: &PiiString, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED>")
}

impl std::ops::Deref for ScrubbedPiiString {
    type Target = PiiString;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

/// helper macro to convert to PiiString
pub mod pii_helper {
    macro_rules! newtype_to_pii {
        ($type: ty) => {
            impl From<$type> for crate::PiiString {
                fn from(t: $type) -> Self {
                    crate::PiiString::from(t.0)
                }
            }
        };
    }

    pub(crate) use newtype_to_pii;
}

pub mod api_schema_helper {
    macro_rules! string_api_data_type_alias {
        ($type: ty) => {
            impl paperclip::v2::schema::TypedData for $type {
                fn data_type() -> paperclip::v2::models::DataType {
                    paperclip::v2::models::DataType::String
                }
            }
        };
    }

    macro_rules! api_data_type_alias {
        ($type: ty, $id: ident) => {
            impl paperclip::v2::schema::TypedData for $type {
                fn data_type() -> paperclip::v2::models::DataType {
                    paperclip::v2::models::DataType::$id
                }
            }
        };
    }

    pub(crate) use api_data_type_alias;
    pub(crate) use string_api_data_type_alias;
}

impl<T> From<T> for PiiString
where
    T: Display,
{
    fn from(pii: T) -> Self {
        Self(format!("{}", pii))
    }
}

impl PiiString {
    pub fn new(pii: String) -> Self {
        Self(pii)
    }

    pub fn leak(&self) -> &str {
        &self.0
    }

    pub fn leak_to_string(&self) -> String {
        self.0.clone()
    }

    /// compare PII to string
    pub fn equals(&self, s: &str) -> bool {
        self.0 == s
    }

    pub fn clean_for_fingerprint(&self) -> PiiString {
        PiiString(self.0.trim().to_lowercase())
    }
}

impl Debug for PiiString {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted>")
    }
}

string_api_data_type_alias!(PiiString);

pub struct NewData {
    pub data_attribute: DataAttribute,
    pub data: PiiString,
}

impl NewData {
    pub fn list<P: Into<PiiString>>(data: Vec<(DataAttribute, P)>) -> Vec<Self> {
        data.into_iter()
            .map(|(data_attribute, pii)| Self {
                data_attribute,
                data: pii.into(),
            })
            .collect()
    }

    pub fn single<P: Into<PiiString>>(data_attribute: DataAttribute, pii: P) -> Vec<Self> {
        vec![Self {
            data_attribute,
            data: pii.into(),
        }]
    }
}

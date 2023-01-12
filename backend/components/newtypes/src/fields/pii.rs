use crate::Base64Data;

use super::api_schema_helper::string_api_data_type_alias;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::{
    fmt::{Debug, Display},
    str::Utf8Error,
};

/// Represents a string that hides PII
#[derive(Clone, Deserialize, Serialize, Default, PartialEq, Eq, Hash, JsonSchema)]
#[serde(transparent)]
pub struct PiiString(String);

/// Represents a Vec<u8> that hides PII
#[derive(Clone, Deserialize, Serialize, Default, PartialEq, Eq, Hash, JsonSchema)]
#[serde(transparent)]
pub struct PiiBytes(Vec<u8>);

impl PiiBytes {
    pub fn new(data: Vec<u8>) -> Self {
        Self(data)
    }

    pub fn into_leak_base64(self) -> Base64Data {
        Base64Data(self.0)
    }

    pub fn into_leak(self) -> Vec<u8> {
        self.0
    }
}

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

impl TryFrom<PiiBytes> for PiiString {
    type Error = Utf8Error;

    fn try_from(value: PiiBytes) -> Result<Self, Self::Error> {
        Ok(PiiString::new(std::str::from_utf8(&value.0)?.to_string()))
    }
}

impl Debug for PiiString {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted>")
    }
}

impl Debug for PiiBytes {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted bytes>")
    }
}

impl Debug for ScrubbedPiiString {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl From<PiiString> for reqwest::Body {
    fn from(v: PiiString) -> Self {
        Self::from(v.0)
    }
}

string_api_data_type_alias!(PiiString);

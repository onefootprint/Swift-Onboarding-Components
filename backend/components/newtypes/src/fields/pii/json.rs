use serde::{Deserialize, Serialize};
use std::fmt::Debug;

use crate::{PiiBytes, PiiString};

/// Represents a struct that hides PII contained in JsonValues (usually from vendor responses)
#[derive(Clone, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(transparent)]
pub struct PiiJsonValue(pub(super) serde_json::Value);

impl PiiJsonValue {
    pub fn new(value: serde_json::Value) -> Self {
        Self(value)
    }

    pub fn leak(&self) -> &serde_json::Value {
        &self.0
    }

    pub fn into_leak(self) -> serde_json::Value {
        self.0
    }

    // this will error if value has non-string keys
    pub fn leak_to_vec(&self) -> Result<Vec<u8>, serde_json::Error> {
        serde_json::to_vec(self.leak())
    }
}

impl paperclip::v2::schema::TypedData for PiiJsonValue {}

impl From<serde_json::Value> for PiiJsonValue {
    fn from(value: serde_json::Value) -> Self {
        Self(value)
    }
}

impl Debug for PiiJsonValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted json value>")
    }
}

// used in the decrypt path
impl TryFrom<Vec<u8>> for PiiJsonValue {
    type Error = serde_json::Error;

    fn try_from(vec: Vec<u8>) -> Result<Self, Self::Error> {
        serde_json::from_slice(vec.as_slice()).map(Self::new)
    }
}

impl<'a> TryFrom<&'a PiiJsonValue> for PiiString {
    type Error = serde_json::Error;

    fn try_from(v: &'a PiiJsonValue) -> Result<Self, Self::Error> {
        serde_json::ser::to_string(v.leak()).map(PiiString::new)
    }
}

impl<'a> TryFrom<&'a PiiString> for PiiJsonValue {
    type Error = serde_json::Error;

    fn try_from(value: &'a PiiString) -> Result<Self, Self::Error> {
        serde_json::from_str(value.leak()).map(Self::new)
    }
}

impl TryFrom<PiiBytes> for PiiJsonValue {
    type Error = serde_json::Error;

    fn try_from(value: PiiBytes) -> Result<Self, Self::Error> {
        Self::try_from(value.into_leak())
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct ScrubbedPiiJsonValue(serde_json::Value);
impl ScrubbedPiiJsonValue {
    pub fn scrub<T: serde::Serialize>(s: T) -> Result<Self, serde_json::Error> {
        let val = serde_json::to_value(s)?;
        Ok(Self(val))
    }
    pub fn inner(self) -> serde_json::Value {
        self.0
    }
}

impl From<ScrubbedPiiJsonValue> for serde_json::Value {
    fn from(v: ScrubbedPiiJsonValue) -> Self {
        v.0
    }
}

impl From<serde_json::Value> for ScrubbedPiiJsonValue {
    fn from(v: serde_json::Value) -> Self {
        Self(v)
    }
}

impl From<ScrubbedPiiJsonValue> for PiiJsonValue {
    fn from(s: ScrubbedPiiJsonValue) -> Self {
        Self(s.0)
    }
}

impl Debug for ScrubbedPiiJsonValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted json value>")
    }
}

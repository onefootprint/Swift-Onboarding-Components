use serde::{Deserialize, Serialize};
use std::fmt::Debug;

use crate::{PiiBytes, PiiString, PiiValueKind, VResult};

/// Wrapper to hide PII around serde_json::Value that contains all variants of values
#[derive(Clone, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(transparent)]
pub struct PiiJsonValue(pub(super) serde_json::Value);

impl PiiJsonValue {
    /// Extracts the PiiString value from self, IF self is a Value::String variant
    pub fn as_string(self) -> VResult<PiiString> {
        match self.0 {
            serde_json::Value::String(s) => Ok(PiiString::new(s)),
            _ => Err(crate::data_identifier::ValidationError::ExpectedStringFormat),
        }
    }

    /// Creates a variant that is Value::String
    pub fn string(value: &str) -> Self {
        Self(serde_json::Value::String(value.to_owned()))
    }

    /// Utility to deserialize the value into T.
    /// This is unique in that it also tries to deserialize Value::String values into T,
    /// instead of just the respective Value::Array or Value::Object
    pub fn deserialize_maybe_str<T>(self) -> Result<T, serde_json::Error>
    where
        T: serde::de::DeserializeOwned,
    {
        let result = if let serde_json::Value::String(s) = &self.0 {
            serde_json::de::from_str(s)?
        } else {
            serde_json::value::from_value::<T>(self.0)?
        };
        Ok(result)
    }

    /// Utility to serialize the value a PiiString.
    /// This is unique in that it returns a PiiString if self is a Value::String, otherwise
    /// it uses serde to serialize the value into a PiiString
    pub fn to_piistring(self) -> Result<PiiString, serde_json::Error> {
        let result = if let serde_json::Value::String(s) = &self.0 {
            PiiString::new(s.to_owned())
        } else {
            PiiString::new(serde_json::ser::to_string(&self.0)?)
        };
        Ok(result)
    }
}

impl PiiString {
    pub fn str_or_json(self, serialization: PiiValueKind) -> PiiJsonValue {
        match serialization {
            PiiValueKind::String => PiiJsonValue(serde_json::Value::String(self.0)),
            PiiValueKind::Json => {
                PiiJsonValue::try_from(&self)
                // If the value isn't json serializable, just return it as a string
                .unwrap_or(PiiJsonValue(serde_json::Value::String(self.0)))
            }
        }
    }
}

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
        f.debug_struct("PiiJsonValue")
            .field("data", &"<redacted>")
            .finish()
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
        f.debug_struct("ScrubbedPiiJsonValue")
            .field("data", &"<redacted>")
            .finish()
    }
}

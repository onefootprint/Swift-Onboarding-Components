use crate::{
    PiiBytes,
    PiiString,
    VResult,
    VaultDataFormat,
};
use serde::{
    Deserialize,
    Serialize,
};
use std::fmt::Debug;
use std::str::FromStr;

/// Wrapper to hide PII around serde_json::Value that contains all variants of values
#[derive(Clone, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(transparent)]
pub struct PiiJsonValue(pub(super) serde_json::Value);

/// Discriminants for serde_json::Value
#[derive(Debug, strum_macros::Display, Eq, PartialEq)]
#[strum(serialize_all = "PascalCase")]
pub enum PiiValueKind {
    Null,
    Bool,
    Number,
    String,
    Array,
    Object,
}

impl<'a> From<&'a PiiJsonValue> for PiiValueKind {
    fn from(value: &'a PiiJsonValue) -> Self {
        match value.0 {
            serde_json::Value::Null => Self::Null,
            serde_json::Value::Bool(_) => Self::Bool,
            serde_json::Value::Number(_) => Self::Number,
            serde_json::Value::String(_) => Self::String,
            serde_json::Value::Array(_) => Self::Array,
            serde_json::Value::Object(_) => Self::Object,
        }
    }
}

impl PiiJsonValue {
    /// Extracts the PiiString value from self, IF self is a Value::String variant
    pub fn as_string(self) -> VResult<PiiString> {
        match self.0 {
            serde_json::Value::String(s) => Ok(PiiString::new(s)),
            _ => Err(crate::data_identifier::DiValidationError::ExpectedStringFormat),
        }
    }

    /// Returns true if the value is a String and doesn't need to be serialized to be stored in the
    /// vault
    pub fn is_string(&self) -> bool {
        matches!(self.0, serde_json::Value::String(_))
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

    /// Creates a variant that is Value::String from a PiiString
    pub fn from_piistring(value: PiiString) -> Self {
        Self(serde_json::Value::String(value.0))
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

    /// If self is a String type, trim excess whitespace
    pub fn trim_whitespace(self) -> Self {
        match self {
            Self(serde_json::Value::String(s)) => Self(serde_json::Value::String(s.trim().to_string())),
            v => v,
        }
    }
}

impl PiiString {
    pub fn str_or_json(self, serialization: VaultDataFormat) -> PiiJsonValue {
        match serialization {
            VaultDataFormat::String => PiiJsonValue(serde_json::Value::String(self.0)),
            VaultDataFormat::Json => {
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

impl FromStr for PiiJsonValue {
    type Err = serde_json::Error;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        serde_json::from_str(value).map(Self::new)
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

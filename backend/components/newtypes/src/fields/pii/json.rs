use crate::PiiBytes;
use crate::PiiString;
use crate::VResult;
use crate::VaultDataFormat;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

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
                // Try to JSON deserialize the string value. If the value isn't a JSON-serialized string, just
                // return it as a string
                PiiJsonValue::parse_from_str(self.leak()).unwrap_or(PiiJsonValue::new_string(self.0))
            }
        }
    }
}

impl PiiJsonValue {
    pub fn new(value: serde_json::Value) -> Self {
        Self(value)
    }

    pub fn new_string(value: String) -> Self {
        Self(serde_json::Value::String(value))
    }

    /// Creates a variant that is Value::String
    pub fn string(value: &str) -> Self {
        Self(serde_json::Value::String(value.to_owned()))
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

    pub fn parse_from_pii_bytes(bytes: PiiBytes) -> Result<Self, serde_json::Error> {
        serde_json::from_slice(&bytes.0).map(Self::new)
    }

    pub fn parse_from_str(value: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(value).map(Self::new)
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

/// This struct is used to scrub a PiiJsonValue
#[derive(Clone, serde::Serialize, serde::Deserialize, Default, derive_more::Deref, PartialEq, Eq)]
pub struct ScrubbedPiiJsonValue(
    #[serde(serialize_with = "scrub_pii_value")]
    #[deref]
    PiiJsonValue,
);

impl From<ScrubbedPiiJsonValue> for PiiJsonValue {
    fn from(s: ScrubbedPiiJsonValue) -> Self {
        s.0
    }
}

impl Debug for ScrubbedPiiJsonValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ScrubbedPiiJsonValue")
            .field("data", &"<redacted>")
            .finish()
    }
}

fn scrub_pii_value<S>(_v: &PiiJsonValue, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED Value>")
}

impl From<PiiString> for PiiJsonValue {
    fn from(s: PiiString) -> Self {
        // No parsing, just creates a String variant of PiiJsonValue with the provided contents
        Self(serde_json::Value::String(s.0))
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Deserialize, Serialize, Debug)]
    pub struct SomeVendorResponse {
        pub pii: ScrubbedPiiJsonValue,
    }

    #[test]
    fn test_scrubbed_pii_json_value() {
        let raw = serde_json::json!({
            "pii": "SSN 12345"
        });
        let deserialized: SomeVendorResponse = serde_json::from_value(raw).unwrap();

        assert_eq!(
            "SomeVendorResponse { pii: ScrubbedPiiJsonValue { data: \"<redacted>\" } }",
            format!("{:?}", deserialized)
        );

        let reserialized = serde_json::to_value(&deserialized).unwrap();
        assert_eq!(
            serde_json::json!({
                "pii": "<SCRUBBED Value>"
            }),
            reserialized
        );
    }
}

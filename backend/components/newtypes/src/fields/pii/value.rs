use serde::Deserialize;
use serde::Serialize;
use strum_macros::{Display, EnumDiscriminants};

use crate::PiiJsonValue;
use crate::PiiString;
use crate::VResult;

#[derive(Clone, Deserialize, Serialize, EnumDiscriminants)]
#[strum_discriminants(name(PiiValueKind))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(derive(Display))]
#[serde(untagged)]
pub enum PiiValue {
    String(PiiString),
    // TODO Make sure we serialize strings always as PiiValue::String....
    Json(PiiJsonValue),
}

impl From<PiiString> for PiiValue {
    fn from(value: PiiString) -> Self {
        Self::String(value)
    }
}

impl paperclip::v2::schema::TypedData for PiiValue {
    fn data_type() -> paperclip::v2::models::DataType {
        // TODO this is technically incorrect
        paperclip::v2::models::DataType::String
    }
}

impl std::fmt::Debug for PiiValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let kind = PiiValueKind::from(self);
        f.debug_struct(&format!("PiiValue::{}", kind))
            .field("data", &"<redacted>")
            .finish()
    }
}
impl PiiValue {
    pub fn as_string(self) -> VResult<PiiString> {
        match self {
            Self::String(s) => Ok(s),
            Self::Json(_) => Err(crate::data_identifier::ValidationError::ExpectedStringFormat),
        }
    }

    pub fn string(value: &str) -> Self {
        Self::String(PiiString::new(value.to_owned()))
    }

    /// Utility to deserialize the value into T.
    /// This is unique in that it also tries to deserialize Value::String values into T,
    /// instead of just the respective Value::Array or Value::Object
    pub fn deserialize_maybe_str<T>(self) -> Result<T, serde_json::Error>
    where
        T: serde::de::DeserializeOwned,
    {
        let result = match self {
            Self::String(s) => serde_json::de::from_str(s.leak())?,
            Self::Json(v) => serde_json::value::from_value::<T>(v.0)?,
        };
        Ok(result)
    }

    /// Utility to serialize the value a PiiString.
    /// This is unique in that it returns a PiiString if self is a Value::String, otherwise
    /// it uses serde to serialize the value into a PiiString
    pub fn to_piistring(self) -> Result<PiiString, serde_json::Error> {
        let result = match self {
            Self::String(s) => s,
            Self::Json(v) => PiiString::new(serde_json::ser::to_string(&v.0)?),
        };
        Ok(result)
    }
}

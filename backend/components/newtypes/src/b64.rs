use paperclip::actix::Apiv2Schema;
use serde::{
    de,
    Deserialize,
    Deserializer,
    Serialize,
};
use std::fmt::Display;
use std::str::FromStr;

const B64_CONFIG: base64::Config = base64::URL_SAFE_NO_PAD;

#[derive(Debug, Default, Clone, PartialEq, Eq, Hash, Apiv2Schema)]
pub struct Base64Data(pub Vec<u8>);
/// represents a string that has been encoded as base 64
#[derive(Debug, Default, Clone, PartialEq, Eq, Hash, Apiv2Schema)]
pub struct Base64EncodedString(pub String);

impl Base64Data {
    pub fn from_str_standard(s: &str) -> Result<Self, base64::DecodeError> {
        base64::decode_config(s, base64::STANDARD).map(Self)
    }

    pub fn into_string_standard(b: Vec<u8>) -> Base64EncodedString {
        Base64EncodedString(base64::encode_config(b, base64::STANDARD))
    }
}

impl Base64Data {
    pub fn to_string_standard(self) -> Base64EncodedString {
        Self::into_string_standard(self.0)
    }
}

impl AsRef<[u8]> for Base64Data {
    fn as_ref(&self) -> &[u8] {
        self.0.as_slice()
    }
}

impl Display for Base64Data {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        base64::encode_config(&self.0, B64_CONFIG).fmt(f)
    }
}

impl FromStr for Base64Data {
    type Err = base64::DecodeError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        base64::decode_config(s, B64_CONFIG).map(Self)
    }
}

impl<'de> Deserialize<'de> for Base64Data {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(de::Error::custom)
    }
}

impl Serialize for Base64Data {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let s = self.to_string();
        serializer.serialize_str(&s)
    }
}

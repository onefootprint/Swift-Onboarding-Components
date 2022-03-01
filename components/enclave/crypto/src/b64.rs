use std::{fmt::Display, str::FromStr};

use serde::{de, Deserialize, Deserializer, Serialize};

const B64_CONFIG: base64::Config = base64::URL_SAFE_NO_PAD;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Base64Data(pub Vec<u8>);
impl Default for Base64Data {
    fn default() -> Self {
        Base64Data(Vec::default())
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

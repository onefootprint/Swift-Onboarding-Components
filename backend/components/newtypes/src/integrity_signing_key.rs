use derive_more::{
    From,
    Into,
};
use serde::{
    Deserialize,
    Deserializer,
    Serialize,
};
use std::str::FromStr;

/// A secret api key wrapper around a string
#[derive(Clone, Hash, PartialEq, Eq, From, Into, Default)]
pub struct IntegritySigningKey(Vec<u8>);

impl IntegritySigningKey {
    /// leak the signing key
    pub fn leak(&self) -> Vec<u8> {
        self.0.clone()
    }
}

impl paperclip::v2::schema::TypedData for IntegritySigningKey {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }

    fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
        None
    }
}

impl std::fmt::Display for IntegritySigningKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        crypto::hex::encode(&self.0).fmt(f)
    }
}

impl FromStr for IntegritySigningKey {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self(crypto::hex::decode(s)?))
    }
}

impl std::fmt::Debug for IntegritySigningKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        "redacted<IntegritySigningKey>".fmt(f)
    }
}

impl<'de> Deserialize<'de> for IntegritySigningKey {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

impl Serialize for IntegritySigningKey {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let s = self.to_string();
        serializer.serialize_str(&s)
    }
}

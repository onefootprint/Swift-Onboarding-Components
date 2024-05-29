use crate::{
    Base64Data,
    PiiString,
};
use paperclip::v2::schema::TypedData;
use serde::{
    Deserialize,
    Serialize,
};
use std::fmt::Debug;

/// Represents a Vec<u8> that hides PII
#[derive(Clone, Deserialize, Serialize, Default, PartialEq, Eq, Hash)]
#[serde(transparent)]
pub struct PiiBytes(pub(super) Vec<u8>);

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

    pub fn leak_slice(&self) -> &[u8] {
        &self.0
    }

    pub fn into_base64_pii(self) -> PiiString {
        PiiString::from(self.into_leak_base64().to_string_standard().0)
    }
}
impl crypto::hex::ToHex for PiiBytes {
    fn encode_hex<T: std::iter::FromIterator<char>>(&self) -> T {
        self.0.encode_hex()
    }

    fn encode_hex_upper<T: std::iter::FromIterator<char>>(&self) -> T {
        self.0.encode_hex_upper()
    }
}

impl crypto::hex::FromHex for PiiBytes {
    type Error = crypto::hex::FromHexError;

    fn from_hex<T: AsRef<[u8]>>(hex: T) -> Result<Self, Self::Error> {
        Ok(PiiBytes(Vec::from_hex(hex.as_ref())?))
    }
}

impl TypedData for PiiBytes {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }

    fn format() -> Option<paperclip::v2::models::DataTypeFormat> {
        Some(paperclip::v2::models::DataTypeFormat::Binary)
    }
}

impl Debug for PiiBytes {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted bytes>")
    }
}

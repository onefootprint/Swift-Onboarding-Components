use std::fmt::Debug;

use serde::{Deserialize, Serialize};
use strum_macros::EnumDiscriminants;

#[derive(Clone, Serialize, Deserialize)]
pub struct KmsCredentials {
    pub region: String,
    pub key_id: String,
    pub secret_key: String,
    pub session_token: Option<String>,
}
impl Debug for KmsCredentials {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("KmsCredentials")
            .field("region", &self.region)
            .field("key_id", &self.key_id)
            .field("secret_key", &"<omitted>")
            .field("session_token", &"<omitted>")
            .finish()
    }
}

#[derive(Clone, Serialize, Deserialize, EnumDiscriminants, PartialEq, Hash, Eq, Default)]
#[strum_discriminants(name(DataTransformName))]
#[strum_discriminants(derive(strum_macros::Display, strum::EnumString, Hash))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[serde(rename_all = "snake_case")]
#[serde(tag = "type")]
pub enum DataTransform {
    #[default]
    /// no transform, just the plain data
    Identity,
    /// HMAC-SHA256
    HmacSha256 {
        key: Vec<u8>,
    },
    ///
    ToLowercase,
    ToUppercase,
    ToAscii,
    Prefix {
        count: usize,
    },
    Suffix {
        count: usize,
    },
}

impl std::fmt::Debug for DataTransform {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        DataTransformName::from(self).fmt(f)
    }
}

impl std::fmt::Display for DataTransform {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(&DataTransformName::from(self), f)
    }
}

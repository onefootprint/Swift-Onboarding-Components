use std::fmt::Debug;

use serde::{Deserialize, Serialize};

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

#[derive(Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "type")]
pub enum DataTransform {
    #[default]
    /// no transform, just the plain data
    Identity,
    /// HMAC-SHA256
    HmacSha256 { key: Vec<u8> },
}

impl std::fmt::Debug for DataTransform {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Identity => write!(f, "Identity"),
            Self::HmacSha256 { .. } => write!(f, "HmacSha256"),
        }
    }
}

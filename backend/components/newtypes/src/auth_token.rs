use crypto::{random::gen_random_alphanumeric_code, sha256};
use derive_more::{Display, Into};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::{AuthTokenHash, PiiString};

/// An cryptographically generated auth token to authenticate a session
#[derive(
    Clone, Hash, PartialEq, Eq, Display, Into, Serialize, Deserialize, Default, Apiv2Schema, JsonSchema,
)]
#[serde(transparent)]
pub struct SessionAuthToken(String);

impl std::fmt::Debug for SessionAuthToken {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted>")
    }
}

impl From<PiiString> for SessionAuthToken {
    fn from(value: PiiString) -> Self {
        Self(value.leak_to_string())
    }
}

impl SessionAuthToken {
    const PREFIX: &'static str = "tok_";
    const LEN_RANDOM_CHARS: usize = 34;

    /// generates a random new auth token
    pub fn generate() -> Self {
        Self(format!(
            "{}{}",
            Self::PREFIX,
            gen_random_alphanumeric_code(Self::LEN_RANDOM_CHARS)
        ))
    }

    /// computes the "id" for the auth token by taking it's hash
    pub fn id(&self) -> AuthTokenHash {
        AuthTokenHash::from(crypto::hex::encode(self.hash_bytes()))
    }

    /// computes the hash of the auth token as bytes
    pub fn hash_bytes(&self) -> [u8; 32] {
        sha256(self.0.as_bytes())
    }
}

impl AsRef<str> for SessionAuthToken {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

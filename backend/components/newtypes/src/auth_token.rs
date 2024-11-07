use crate::AuthTokenHash;
use crate::PiiString;
use crypto::random::gen_random_alphanumeric_code;
use crypto::sha256;
use derive_more::Display;
use derive_more::Into;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;

#[derive(Clone, Hash, PartialEq, Eq, Display, Into, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(transparent)]
#[openapi(inline)]
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

impl<'a> From<&'a PiiString> for SessionAuthToken {
    fn from(value: &'a PiiString) -> Self {
        Self(value.leak_to_string())
    }
}

impl SessionAuthToken {
    const LEN_RANDOM_CHARS: usize = 34;
    const PREFIX: &'static str = "tok_";

    /// generates a random new auth token
    pub fn generate(prefix: &str) -> Self {
        Self(format!(
            "{}{}{}",
            prefix,
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

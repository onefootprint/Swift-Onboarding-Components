use crypto::{random::gen_random_alphanumeric_code, sha256};
pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

/// An cryptographically generated auth token to authenticate a session
#[derive(
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    Display,
    From,
    Into,
    FromStr,
    Serialize,
    Deserialize,
    Default,
    Apiv2Schema,
)]
#[serde(transparent)]
pub struct SessionAuthToken(String);

impl SessionAuthToken {
    const PREFIX: &'static str = "vtok_";
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
    pub fn id(&self) -> String {
        crypto::hex::encode(sha256(self.0.as_bytes()))
    }
}

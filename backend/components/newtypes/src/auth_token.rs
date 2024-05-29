use crate::{
    AuthTokenHash,
    PiiString,
};
use crypto::random::gen_random_alphanumeric_code;
use crypto::sha256;
use derive_more::{
    Display,
    Into,
};
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};

/// An cryptographically generated auth token to authenticate a session
#[derive(Clone, Hash, PartialEq, Eq, Display, Into, Serialize, Deserialize, Default, Apiv2Schema)]
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

impl<'a> From<&'a PiiString> for SessionAuthToken {
    fn from(value: &'a PiiString) -> Self {
        Self(value.leak_to_string())
    }
}

pub enum SessionAuthTokenKind {
    WorkOs,
    TenantRb,
    FirmEmployee,
    ClientTenant,
    User,
    EmailVerify,
    ValidateUserToken,
    OnboardingSession,
    BusinessOwner,
    SdkArgs,
}

impl SessionAuthTokenKind {
    /// A token-type-specific prefix to help differentiate between tok_s
    fn prefix(&self) -> &str {
        match self {
            Self::ClientTenant => "ct",
            Self::User => "u",
            Self::EmailVerify => "ev",
            Self::ValidateUserToken => "v",
            Self::OnboardingSession => "ob",
            Self::BusinessOwner => "bo",
            Self::SdkArgs => "sdk",
            // These three are all very similar purpose. We also don't issue a new token when
            // they are updated between these token types
            Self::WorkOs => "db",
            Self::TenantRb => "db",
            Self::FirmEmployee => "db",
        }
    }
}

impl SessionAuthToken {
    const LEN_RANDOM_CHARS: usize = 34;
    const PREFIX: &'static str = "tok_";

    /// generates a random new auth token
    pub fn generate(kind: SessionAuthTokenKind) -> Self {
        Self(format!(
            "{}{}{}",
            kind.prefix(),
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

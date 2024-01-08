use crate::errors::{challenge::ChallengeError, ApiError};
use chrono::{DateTime, Duration, Utc};
use crypto::aead::{AeadSealedBytes, ScopedSealingKey};
use newtypes::{Base64Data, ContactInfoKind};
use paperclip::actix::Apiv2Schema;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::str::FromStr;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Challenge<C> {
    pub expires_at: DateTime<Utc>,
    pub data: C,
}

impl<C> Challenge<C> {
    pub fn new(data: C) -> Self {
        let expires_at = Utc::now() + Duration::minutes(5);
        Self { data, expires_at }
    }
}

#[derive(
    Debug, Clone, Eq, PartialEq, Apiv2Schema, serde::Serialize, serde::Deserialize, strum_macros::Display,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ChallengeKind {
    Sms,
    #[strum(serialize = "biometric")]
    #[serde(rename = "biometric")]
    #[serde(alias = "passkey")]
    Passkey,
    Email,
}

impl From<ContactInfoKind> for ChallengeKind {
    fn from(value: ContactInfoKind) -> Self {
        match value {
            ContactInfoKind::Email => Self::Email,
            ContactInfoKind::Phone => Self::Sms,
        }
    }
}

#[doc = "Encrypted, base64-encoded challenge information"]
#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(transparent)]
pub struct ChallengeToken(String);

impl<C: Serialize + DeserializeOwned + std::fmt::Debug> Challenge<C> {
    pub fn seal(&self, key: &ScopedSealingKey) -> Result<ChallengeToken, ApiError> {
        let vec = key.seal(self)?.0;
        Ok(ChallengeToken(Base64Data(vec).to_string()))
    }

    pub fn unseal_string(key: &ScopedSealingKey, sealed: String) -> Result<Self, ApiError> {
        Self::unseal(key, &ChallengeToken(sealed))
    }

    pub fn unseal(key: &ScopedSealingKey, sealed: &ChallengeToken) -> Result<Self, ApiError> {
        let sealed = AeadSealedBytes(Base64Data::from_str(&sealed.0).map_err(crypto::Error::from)?.0);
        let unsealed: Self = key.unseal(sealed)?;

        if unsealed.expires_at < Utc::now() {
            return Err(ChallengeError::ChallengeExpired.into());
        }
        Ok(unsealed)
    }
}

impl std::fmt::Display for ChallengeToken {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

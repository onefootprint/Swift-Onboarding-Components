use crate::errors::error_with_code::ErrorWithCode;
use crate::errors::ApiError;
use chrono::DateTime;
use chrono::Duration;
use chrono::Utc;
use crypto::aead::AeadSealedBytes;
use crypto::aead::ScopedSealingKey;
use newtypes::Base64Data;
use newtypes::ChallengeToken;
use serde::de::DeserializeOwned;
use serde::Deserialize;
use serde::Serialize;
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
            return Err(ErrorWithCode::ChallengeExpired.into());
        }
        Ok(unsealed)
    }
}

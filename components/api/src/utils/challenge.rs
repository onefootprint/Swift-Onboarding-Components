use std::str::FromStr;

use chrono::{NaiveDateTime, Utc};
use crypto::{aead::ScopedSealingKey, b64::Base64Data};
use serde::{de::DeserializeOwned, Deserialize, Serialize};

use crate::errors::ApiError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Challenge<C> {
    pub expires_at: NaiveDateTime,
    pub data: C,
}

impl<C: Serialize + DeserializeOwned + std::fmt::Debug> Challenge<C> {
    pub fn seal(&self, key: &ScopedSealingKey) -> Result<String, ApiError> {
        let vec = key.seal(self)?;
        Ok(Base64Data(vec).to_string())
    }

    pub fn unseal(key: &ScopedSealingKey, sealed: &str) -> Result<Self, ApiError> {
        let sealed = Base64Data::from_str(sealed).map_err(crypto::Error::from)?.0;
        let unsealed: Self = key.unseal(&sealed)?;

        if unsealed.expires_at < Utc::now().naive_utc() {
            return Err(ApiError::ChallengeExpired);
        }
        Ok(unsealed)
    }
}

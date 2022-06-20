use std::str::FromStr;

use chrono::{NaiveDateTime, Utc};
use crypto::aead::ScopedSealingKey;
use newtypes::Base64Data;
use paperclip::actix::Apiv2Schema;
use serde::{de::DeserializeOwned, Deserialize, Serialize};

use crate::errors::ApiError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Challenge<C> {
    pub expires_at: NaiveDateTime,
    pub data: C,
}

#[doc = "Encrypted, base64-encoded challenge information"]
#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(transparent)]
pub struct ChallengeToken(String);

impl<C: Serialize + DeserializeOwned + std::fmt::Debug> Challenge<C> {
    pub fn seal(&self, key: &ScopedSealingKey) -> Result<ChallengeToken, ApiError> {
        let vec = key.seal(self)?;
        Ok(ChallengeToken(Base64Data(vec).to_string()))
    }

    pub fn unseal(key: &ScopedSealingKey, sealed: &ChallengeToken) -> Result<Self, ApiError> {
        let sealed = Base64Data::from_str(&sealed.0).map_err(crypto::Error::from)?.0;
        let unsealed: Self = key.unseal(&sealed)?;

        if unsealed.expires_at < Utc::now().naive_utc() {
            return Err(ApiError::ChallengeExpired);
        }
        Ok(unsealed)
    }
}

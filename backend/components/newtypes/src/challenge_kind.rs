use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

use crate::ContactInfoKind;

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
pub struct ChallengeToken(pub String);

impl std::fmt::Display for ChallengeToken {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

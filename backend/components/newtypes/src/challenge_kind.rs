use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    Hash,
    Apiv2Schema,
    serde::Serialize,
    serde::Deserialize,
    strum_macros::Display,
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

#[doc = "Encrypted, base64-encoded challenge information"]
#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(transparent)]
pub struct ChallengeToken(pub String);

impl std::fmt::Display for ChallengeToken {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

use newtypes::{email::Email, ChallengeKind, ChallengeToken, PhoneNumber};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UserChallengeVerifyRequest {
    /// The token given from initiating the challenge
    pub challenge_token: ChallengeToken,
    /// The response to the challenge. Either SMS/email PIN code or passkey response
    pub challenge_response: String,
}

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct UserChallengeRequest {
    /// If the challenge kind is SMS, the phone number to send the challenge to
    pub phone_number: Option<PhoneNumber>,
    /// If the challenge kind is email, the email address to send the challenge to
    pub email: Option<Email>,
    /// The kind of challenge to initiate
    pub kind: ChallengeKind,
    /// Specifies whether to add the new auth method alongside existing auth methods or replace
    /// the existing method.
    pub action_kind: ActionKind,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ActionKind {
    /// Replace the existing auth method
    Replace,
    /// Add the provided auth method
    Add,
}

#[derive(Apiv2Schema, serde::Serialize)]
pub struct UserChallengeResponse {
    /// If the challenge kind is biometric, the challenge JSON for the browser
    pub biometric_challenge_json: Option<String>,
    /// Information saved client side and sent back with the challenge response
    pub challenge_token: ChallengeToken,
    /// The timeout until you're allowed to initiate another challenge
    pub time_before_retry_s: i64,
}

#[derive(serde::Serialize)]
pub struct ErrorChallengeResponse {
    pub error: String,
}

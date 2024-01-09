use newtypes::email::Email;

use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
/// An identifier for the identify flow that will uniquely identify a user
pub enum IdentifyId {
    Email(Email),
    PhoneNumber(PhoneNumber),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    pub identifier: Option<IdentifyId>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyResponse {
    pub user_found: bool,
    pub available_challenge_kinds: Option<Vec<ChallengeKind>>,
    /// signals that one or more biometric credentials
    /// support syncing and may be available to use on desktop/other devices
    pub has_syncable_pass_key: bool,
    pub is_unverified: bool,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct UserChallengeData {
    pub challenge_kind: ChallengeKind,
    pub challenge_token: ChallengeToken,
    /// For login challenges, provide some context on where the challenge was sent
    pub scrubbed_phone_number: Option<PiiString>,
    pub biometric_challenge_json: Option<String>,
    pub time_before_retry_s: i64,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct LoginChallengeRequest {
    pub identifier: Option<IdentifyId>,
    pub preferred_challenge_kind: ChallengeKind,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct LoginChallengeResponse {
    pub challenge_data: UserChallengeData,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct SignupChallengeRequest {
    pub phone_number: Option<PhoneNumber>,
    pub email: Option<Email>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct SignupChallengeResponse {
    pub challenge_data: UserChallengeData,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct IdentifyVerifyRequest {
    /// Opaque challenge state token
    pub challenge_token: ChallengeToken,
    pub challenge_response: String,
    /// Determines which scopes the issued auth token will have. Request the correct scopes for
    /// your use case in order to get the least permissions required
    pub scope: IdentifyScope,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct IdentifyVerifyResponse {
    pub auth_token: SessionAuthToken,
}

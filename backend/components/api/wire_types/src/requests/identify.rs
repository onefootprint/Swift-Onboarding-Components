use newtypes::{
    email::Email, AuthMethodKind, ChallengeKind, ChallengeToken, IdentifyScope, PhoneNumber, PiiString,
    SessionAuthToken,
};

use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
/// An identifier for the identify flow that will uniquely identify a user
pub enum IdentifyId {
    Email(Email),
    PhoneNumber(PhoneNumber),
}

#[derive(Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    pub identifier: Option<IdentifyId>,
    /// Determines which scopes the issued auth token will have. Request the correct scopes for
    /// your use case in order to get the least permissions required
    #[openapi(required)]
    // TODO make required once all clients are updated
    pub scope: Option<IdentifyScope>,
}

#[derive(Apiv2Schema, serde::Serialize, Default)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyResponse {
    /// Deprecated
    #[openapi(skip)]
    pub user_found: bool,
    /// When user_found is true, all of the context on the identified user
    pub user: Option<IdentifiedUser>,

    #[openapi(skip)]
    /// Deprecated
    pub available_challenge_kinds: Option<Vec<ChallengeKind>>,
    /// signals that one or more biometric credentials
    /// support syncing and may be available to use on desktop/other devices
    #[openapi(skip)]
    /// Deprecated
    pub has_syncable_pass_key: bool,
    #[openapi(skip)]
    /// Deprecated
    pub is_unverified: bool,
    /// Populated only when identifying a user via auth token
    #[openapi(skip)]
    /// Deprecated
    pub scrubbed_phone: Option<PiiString>,
    /// Populated only when identifying a user via auth token
    #[openapi(skip)]
    /// Deprecated
    pub scrubbed_email: Option<PiiString>,
}

#[derive(Apiv2Schema, serde::Serialize, Clone)]
pub struct IdentifiedUser {
    // TODO make this non-optional when the client starts providing `scope` in the request
    #[openapi(required)]
    pub token: Option<SessionAuthToken>,
    pub available_challenge_kinds: Vec<ChallengeKind>,
    pub auth_methods: Vec<IdentifyAuthMethod>,
    /// signals that one or more biometric credentials
    /// support syncing and may be available to use on desktop/other devices
    pub has_syncable_passkey: bool,
    pub is_unverified: bool,
    /// When true, allowed to create a new user via a signup challenge even when there's already
    /// an existing user with this contact info.
    /// Generally, a user can make a new vault IF they're not in a context logging into a tenant
    /// that they've already onboarded onto
    pub can_initiate_signup_challenge: bool,

    pub scrubbed_phone: Option<PiiString>,
    /// Populated only when identifying a user via auth token that was created by the tenant
    pub scrubbed_email: Option<PiiString>,
}

#[derive(Apiv2Schema, serde::Serialize, Clone)]
pub struct IdentifyAuthMethod {
    pub kind: AuthMethodKind,
    pub is_verified: bool,
}

#[derive(Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct UserChallengeData {
    pub challenge_kind: ChallengeKind,
    pub challenge_token: ChallengeToken,
    /// For login challenges, provide some context on where the challenge was sent
    pub scrubbed_phone_number: Option<PiiString>,
    pub biometric_challenge_json: Option<String>,
    pub time_before_retry_s: i64,
}

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct LoginChallengeRequest {
    pub identifier: Option<IdentifyId>,
    #[serde(alias = "preferred_challenge_kind")]
    pub challenge_kind: ChallengeKind,
}

#[derive(Apiv2Schema, serde::Serialize)]
pub struct LoginChallengeResponse {
    pub challenge_data: UserChallengeData,
    pub error: Option<String>,
}

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct SignupChallengeRequest {
    pub phone_number: Option<PhoneNumber>,
    pub email: Option<Email>,
}

#[derive(Apiv2Schema, serde::Serialize)]
pub struct SignupChallengeResponse {
    pub challenge_data: UserChallengeData,
    pub error: Option<String>,
}

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct IdentifyVerifyRequest {
    /// Opaque challenge state token
    pub challenge_token: ChallengeToken,
    pub challenge_response: String,
    /// Determines which scopes the issued auth token will have. Request the correct scopes for
    /// your use case in order to get the least permissions required
    pub scope: IdentifyScope,
}

#[derive(Apiv2Schema, serde::Serialize)]
pub struct IdentifyVerifyResponse {
    pub auth_token: SessionAuthToken,
}

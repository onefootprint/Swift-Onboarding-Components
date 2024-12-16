use crate::*;
use newtypes::email::Email;
use newtypes::put_data_request::ModernRawUserDataRequest;
use newtypes::AuthMethodKind;
use newtypes::ChallengeKind;
use newtypes::ChallengeToken;
use newtypes::CollectedDataOption;
use newtypes::DataIdentifier;
use newtypes::IdentifyScope;
use newtypes::PhoneNumber;
use newtypes::PiiString;
use newtypes::SessionAuthToken;
use newtypes::UserAuthScope;
use strum::EnumDiscriminants;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize, EnumDiscriminants)]
#[serde(rename_all = "snake_case")]
#[strum_discriminants(name(IdentifyIdKind), vis(pub))]
/// An identifier for the identify flow that will uniquely identify a user
pub enum IdentifyId {
    Email(Email),
    PhoneNumber(PhoneNumber),
}

#[derive(Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    // TODO deprecate
    pub identifier: Option<IdentifyId>,
    pub email: Option<Email>,
    pub phone_number: Option<PhoneNumber>,
    /// Determines which scopes the issued auth token will have. Request the correct scopes for your
    /// use case in order to get the least permissions required
    pub scope: IdentifyScope,
}

#[derive(Apiv2Response, serde::Serialize, Default, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyResponse {
    /// All of the context on the identified user, if found
    pub user: Option<IdentifiedUser>,
}

#[derive(Debug, Apiv2Schema, serde::Serialize, Clone)]
pub struct IdentifiedUser {
    pub token: SessionAuthToken,
    /// The scopes of the returned token
    pub token_scopes: Vec<UserAuthScope>,
    pub available_challenge_kinds: Vec<ChallengeKind>,
    pub auth_methods: Vec<IdentifyAuthMethod>,
    /// Signals that one or more biometric credentials support syncing and may be available to use
    /// on desktop/other devices
    pub has_syncable_passkey: bool,
    pub is_unverified: bool,
    /// When true, allowed to create a new user via a signup challenge even when there's already an
    /// existing user with this contact info. Generally, a user can make a new vault IF they're not
    /// in a context logging into a tenant that they've already onboarded onto
    pub can_initiate_signup_challenge: bool,

    pub scrubbed_phone: Option<PiiString>,
    /// Populated only when identifying a user via auth token that was created by the tenant
    pub scrubbed_email: Option<PiiString>,
    /// The list of DataIdentifiers whose fingerprints matched on the vault
    pub matching_fps: Vec<DataIdentifier>,
}

#[derive(Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct LiteIdentifyRequest {
    pub email: Option<Email>,
    pub phone_number: Option<PhoneNumber>,
}

#[derive(Apiv2Response, serde::Serialize, Default, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct LiteIdentifyResponse {
    pub user_found: bool,
}

#[derive(Debug, Apiv2Schema, serde::Serialize, Clone)]
pub struct IdentifyAuthMethod {
    pub kind: AuthMethodKind,
    pub is_verified: bool,
}

#[derive(Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct UserChallengeData {
    /// Auth token to pass to the verify call
    pub token: Option<SessionAuthToken>,
    pub challenge_kind: ChallengeKind,
    pub challenge_token: ChallengeToken,
    pub biometric_challenge_json: Option<String>,
    pub time_before_retry_s: i64,
}

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct LoginChallengeRequest {
    #[serde(alias = "preferred_challenge_kind")]
    pub challenge_kind: ChallengeKind,
}

#[derive(Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct IdentifyChallengeResponse {
    pub challenge_data: UserChallengeData,
    pub error: Option<String>,
}

#[derive(Debug, Apiv2Schema, serde::Deserialize, Clone)]
#[openapi(inline)]
pub struct SignupChallengeData<T> {
    pub value: T,
    #[serde(default)]
    pub is_bootstrap: bool,
}

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct SignupChallengeRequest {
    pub phone_number: Option<SignupChallengeData<PhoneNumber>>,
    pub email: Option<SignupChallengeData<Email>>,
    pub scope: IdentifyScope,
    pub challenge_kind: ChallengeKind,
}

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct IdentifyVerifyRequest {
    /// Opaque challenge state token
    pub challenge_token: ChallengeToken,
    #[serde(default)]
    #[openapi(optional)]
    pub challenge_response: String,
    /// Determines which scopes the issued auth token will have. Request the correct scopes for your
    /// use case in order to get the least permissions required
    pub scope: IdentifyScope,
}

#[derive(Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct IdentifyVerifyResponse {
    pub auth_token: SessionAuthToken,
}

#[derive(Apiv2Response, serde::Serialize, macros::JsonResponder)]
pub struct GetVerifyContactInfoResponse {
    /// The insight event from the machine that initiated the contact info verify session
    pub origin_insight_event: InsightEvent,
    pub tenant_name: String,
    pub is_verified: bool,
}

#[derive(Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifySessionRequest {
    pub data: ModernRawUserDataRequest,
    pub scope: IdentifyScope,
}

#[derive(Apiv2Response, serde::Serialize, Default, macros::JsonResponder)]
pub struct IdentifySessionResponse {
    pub token: SessionAuthToken,
}

#[derive(Apiv2Response, serde::Serialize, Default, macros::JsonResponder)]
pub struct IdentifyRequirementsResponse {
    pub requirements: Vec<IdentifyRequirement>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema, EnumDiscriminants, derive_more::IsVariant)]
#[strum_discriminants(name(IdentifyRequirementKind), vis(pub))]
#[strum_discriminants(derive(Display))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum IdentifyRequirement {
    CollectData {
        cdo: CollectedDataOption,
    },
    /// A user has been identified via the phone or email on this identify session. You should
    /// proceed by logging into that vault.
    Login {
        user: IdentifiedUser,
    },
    /// A challenge is required by the playbook in order to create the user.
    Challenge {
        /// List of challenge kinds that can meet this requirement
        auth_method: AuthMethodKind,
        challenge_kinds: Vec<ChallengeKind>,
    },
}

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct ChallengeRequest {
    pub challenge_kind: ChallengeKind,
}

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct ChallengeVerifyRequest {
    /// Opaque challenge state token
    pub challenge_token: ChallengeToken,
    /// Required for challenges other than SMS link
    pub challenge_response: Option<String>,
}

use crate::*;
use newtypes::AuthMethodKind;
use newtypes::ContactInfoKind;
use newtypes::FpId;
use newtypes::PiiString;
use newtypes::PreviewApi;
use newtypes::PublishablePlaybookKey;
use newtypes::SessionAuthToken;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(Debug, Default, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateTokenRequest {
    /// The kind of token to create.
    /// - `onboard` creates a token that onboards the user onto a specific playbook, specified by
    ///   the `key`.
    /// - `inherit` creates a token that inherits any operation previously requested via the
    ///   dashboard.
    /// - `user` simply create a token for the user. A playbook key may be provided directly to the
    ///   Footprint Verify SDK to trigger onboarding.
    /// - `update_auth_methods` creates a token that allows the user to update their contact info
    ///   using the Footprint Auth SDK.
    /// You can find more information on the options [here](https://docs.onefootprint.com/articles/integrate/user-specific-sessions#step-2-generate-an-auth-token-for-the-user-on-your-backend-token-kinds).
    #[openapi(required)]
    // TODO make this non-optional once apiture has upgraded
    pub kind: Option<TokenOperationKind>,

    /// Can only be provided when the kind is `onboard`.
    /// Optionally, the publishable key of the playbook onto which you would like this user to
    /// onboard. The user will be asked to provide any missing information required by playbook. If
    /// you provide the key here, you can omit providing it in the frontend Footprint.js SDK
    /// integration.
    pub key: Option<PublishablePlaybookKey>,

    /// The existing business to be linked to this user's onboarding session. Only takes effect when
    /// onboarding onto a KYB playbook.
    /// If no `fp_bid` is provided here when onboarding onto a KYB playbook, the user will be asked
    /// to enter their business information and create a new business.
    #[openapi(example = "null")]
    #[openapi(skip)]
    pub fp_bid: Option<FpId>,

    /// Can only be provided when the kind is `update_auth_methods`. The set of auth methods that
    /// you would like to be allowed to be updated. When not provided, the token allows updating any
    /// auth method.
    #[openapi(example = "null")]
    pub limit_auth_methods: Option<Vec<AuthMethodKind>>,

    /// When true, will not require physical authentication from the user if they have logged into
    /// your organization recently.
    /// This may be useful if a user is running through multiple playbooks and has already recently
    /// logged in.
    #[serde(default)]
    #[openapi(required)]
    #[openapi(gated = "PreviewApi::ImplicitAuth")]
    pub use_implicit_auth: Option<bool>,

    /// When true, you attest that this user has already authenticated to your platform. Footprint
    /// will then not require re-authentication from the user.
    /// You must have already authenticated the user before creating a token with
    /// `use_third_party_auth`. Be very careful using this feature as these tokens will give the
    /// user logged-in access to the provided `fp_id`.
    #[openapi(skip)]
    #[serde(default)]
    pub use_third_party_auth: bool,

    /// Only valid for sessions of kind `onboard` and `user`. Allow the user to
    /// re-onboard onto this playbook even if they have already onboarded onto it. Defaults to
    /// true.
    #[openapi(example = "null")]
    pub allow_reonboard: Option<bool>,

    /// Time to live until this token expires, provided in minutes. Defaults to 60 minutes. Must be
    /// at least 1 minute, at most 1 day
    #[openapi(example = "60")]
    pub ttl_min: Option<u32>,
}

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    EnumString,
    DeserializeFromStr,
    SerializeDisplay,
    Apiv2Schema,
    ::macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum TokenOperationKind {
    /// Onboard onto a specific playbook, specified either through the key in this API or in the
    /// Verify SDK
    Onboard,
    /// Reonboard onto the last playbook that the user onboarded onto
    #[openapi(skip)]
    Reonboard,
    /// Inherit any operation previously requested via the dashboard
    Inherit,
    /// Simply create a token for the user. A playbook key may be provided directly to the Footprint
    /// Verify SDK to trigger onboarding.
    User,
    /// Generate a token and link that allows the user to update their contact info
    UpdateAuthMethods,
}

impl TokenOperationKind {
    /// Returns true if the TokenOperationKind supports providing a playbook `key`
    pub fn allow_obc_key(&self) -> bool {
        match self {
            Self::Onboard => true,
            Self::Reonboard | Self::Inherit | Self::User | Self::UpdateAuthMethods => false,
        }
    }

    /// Returns true if the TokenOperationKind supports providing `limit_auth_methods`
    pub fn allow_limit_auth_methods(&self) -> bool {
        match self {
            Self::UpdateAuthMethods => true,
            Self::Onboard | Self::Reonboard | Self::Inherit | Self::User => false,
        }
    }
}

#[derive(Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateEntityTokenRequest {
    pub kind: TokenOperationKind,
    pub key: Option<PublishablePlaybookKey>,
    #[serde(default)]
    pub send_link: bool,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Response, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct CreateTokenResponse {
    /// A short-lived token that can be passed into the Verify SDK to allow the user to complete the
    /// flow. This is useful when you'd like to open a native interface inside your app for the user
    /// to complete the flow.
    #[openapi(example = "utok_ssPvNRjNGdk8Iq9qgf6lsO2iTVhALuR4Nt")]
    pub token: SessionAuthToken,
    /// A Footprint link embedding the `token` that can be sent to this user to allow them to
    /// complete the flow. This is useful to send in an automated message to the end user.
    #[openapi(
        example = "https://verify.onefootprint.com/?type=user#utok_ssPvNRjNGdk8Iq9qgf6lsO2iTVhALuR4Nt"
    )]
    pub link: PiiString,
    /// The time at which the token (and link) expire
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Response, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct CreateEntityTokenResponse {
    pub token: SessionAuthToken,
    pub link: PiiString,
    pub expires_at: DateTime<Utc>,
    /// When a link was requested to be sent, the method by which the link was sent
    pub delivery_method: Option<ContactInfoKind>,
}

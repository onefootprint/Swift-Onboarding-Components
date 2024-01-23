use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{Display, EnumString};

use crate::*;

#[derive(Default, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateTokenRequest {
    /// The kind of token to create.
    /// `onboard` creates a token that onboards the user onto a specific playbook, specified by the `key`.
    /// `reonboard` creates a token that reonboards the user onto the last playbook that they onboarded onto.
    /// `inherit` creates a token that inherits any operation previously requested via the dashboard.
    /// `user` simply create a token for the user. A playbook key may be provided directly to the Footprint Verify SDK to trigger onboarding.
    #[openapi(required)]
    // TODO make this non-optional once apiture has upgraded
    pub kind: Option<TokenOperationKind>,

    /// When the kind is `onboard`, the publishable key of the playbook onto which you would like
    /// this user to onboard. The user will be asked to provide any missing information required by
    /// playbook. If you provide the key here, you can omit providing it in the frontend
    /// Footprint.js SDK integration.
    pub key: Option<ObConfigurationKey>,

    #[openapi(skip)]
    pub third_party_auth: Option<bool>,
}

#[derive(Display, EnumString, DeserializeFromStr, SerializeDisplay, Apiv2Schema, ::macros::SerdeAttr)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum TokenOperationKind {
    /// Onboard onto a specific playbook, specified either through the key in this API or in the
    /// Verify SDK
    Onboard,
    /// Reonboard onto the last playbook that the user onboarded onto
    Reonboard,
    /// Inherit any operation previously requested via the dashboard
    Inherit,
    /// Simply create a token for the user. A playbook key may be provided directly to the Footprint Verify SDK to trigger onboarding.
    User,
}

#[derive(Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateEntityTokenRequest {
    pub kind: EntityTokenOperationKind,
    pub key: Option<ObConfigurationKey>,
    #[serde(default)]
    pub send_link: bool,
}

#[derive(Display, EnumString, DeserializeFromStr, SerializeDisplay, Apiv2Schema, ::macros::SerdeAttr)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
/// Our dashboard-facing version of the token API creates a disjoint set of tokens to the
/// tenant-facing version.
/// These are the dashboard-facing token kinds
pub enum EntityTokenOperationKind {
    /// Same as TokenOperationKind
    Inherit,
    /// Generate a token and link that allows the user to update their contact info
    UpdateAuthMethods,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateTokenResponse {
    /// A short-lived token that can be passed into the Verify SDK to allow the user to complete the flow.
    pub token: SessionAuthToken,
    /// A Footprint link embedding the `token` that can be sent to this user to allow them to complete the flow.
    #[openapi(example = "https://verify.onefootprint.com/?type=user#tok_ssPvNRjNGdk8Iq9qgf6lsO2iTVhALuR4Nt")]
    pub link: PiiString,
    /// The time at which the token (and link) expire
    pub expires_at: DateTime<Utc>,
}

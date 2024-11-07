use crate::*;
use newtypes::ExternalId;
use newtypes::FpId;
use newtypes::OnboardingStatus;
use newtypes::SandboxId;

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Response, macros::JsonResponder)]
pub struct LiteUser {
    #[openapi(example = "fp_id_7p793EF07xKXHqAeg5VGPj")]
    pub id: FpId,
    /// Only populated for users created in sandbox mode.
    pub sandbox_id: Option<SandboxId>,
    pub external_id: Option<ExternalId>,
}

/// Basic information about a user
#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Response, macros::JsonResponder)]
pub struct User {
    #[openapi(example = "fp_id_7p793EF07xKXHqAeg5VGPj")]
    pub id: FpId,
    pub requires_manual_review: bool,
    pub status: OnboardingStatus,
    pub external_id: Option<ExternalId>,
    /// When non-null, there is additional info pending collection from this user. In this case, you
    /// may create a token for this user with the `inherit` operation. This token can be used to
    /// collect any outstanding information.
    pub requires_additional_info: Option<PublicWorkflowRequest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Response, macros::JsonResponder)]
pub struct PublicWorkflowRequest {
    /// The timestamp at which the additional info was requested.
    pub timestamp: DateTime<Utc>,
    /// The human-readable note you provided in the dashboard when requesting additional info. You
    /// may choose to render this message in your own application.
    pub note: Option<String>,
}

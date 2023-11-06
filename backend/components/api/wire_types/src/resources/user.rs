use crate::*;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct LiteUser {
    #[openapi(example = "fp_id_7p793EF07xKXHqAeg5VGPj")]
    pub id: FpId,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[openapi(skip)]
    pub sandbox_id: Option<SandboxId>,
}

/// Basic information about a user
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct User {
    pub id: FpId,
    pub requires_manual_review: bool,
    pub status: Option<OnboardingStatus>,
}

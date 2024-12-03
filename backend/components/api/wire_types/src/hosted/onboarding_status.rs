use crate::*;
use newtypes::OnboardingRequirement;


#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct OnboardingStatusResponse {
    pub all_requirements: Vec<ApiOnboardingRequirement>,
    /** When true, this session can update their data via `PATCH /hosted/user/vault` */
    pub can_update_user_data: bool,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AuthRequirementsResponse {
    pub all_requirements: Vec<ApiOnboardingRequirement>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiOnboardingRequirement {
    pub is_met: bool,
    #[serde(flatten)]
    #[openapi(skip)]
    /// DEPRECATED: remove this once the client stops reading the inlined, flattened requirement
    /// fields
    pub old_requirement: OnboardingRequirement,
    pub requirement: OnboardingRequirement,
}

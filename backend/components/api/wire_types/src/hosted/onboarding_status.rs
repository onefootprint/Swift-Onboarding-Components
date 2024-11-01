use crate::*;
use newtypes::OnboardingRequirement;


#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct OnboardingStatusResponse {
    pub all_requirements: Vec<ApiOnboardingRequirement>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AuthRequirementsResponse {
    pub all_requirements: Vec<ApiOnboardingRequirement>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiOnboardingRequirement {
    pub is_met: bool,
    #[serde(flatten)]
    pub requirement: OnboardingRequirement,
}

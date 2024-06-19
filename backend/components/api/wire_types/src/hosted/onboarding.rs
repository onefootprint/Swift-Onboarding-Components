use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct OnboardingResponse {
    pub onboarding_config: PublicOnboardingConfiguration,
}

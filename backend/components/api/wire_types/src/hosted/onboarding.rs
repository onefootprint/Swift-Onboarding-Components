use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct OnboardingResponse {
    pub onboarding_config: PublicOnboardingConfiguration,
}

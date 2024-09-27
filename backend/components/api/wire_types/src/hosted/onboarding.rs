use crate::*;
use newtypes::SessionAuthToken;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct OnboardingResponse {
    pub onboarding_config: PublicOnboardingConfiguration,
    pub auth_token: SessionAuthToken,
}

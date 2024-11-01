use crate::*;
use newtypes::SessionAuthToken;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct OnboardingResponse {
    pub auth_token: SessionAuthToken,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct BusinessOnboardingResponse {
    pub auth_token: SessionAuthToken,
}

use newtypes::OnboardingId;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ValidateUserToken {
    pub onboarding_id: OnboardingId,
}

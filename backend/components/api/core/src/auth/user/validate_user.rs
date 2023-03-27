use newtypes::OnboardingId;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ValidateUserToken {
    pub ob_id: OnboardingId,
}

use newtypes::OnboardingLinkId;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ValidateUserToken {
    pub ob_link_id: OnboardingLinkId,
}

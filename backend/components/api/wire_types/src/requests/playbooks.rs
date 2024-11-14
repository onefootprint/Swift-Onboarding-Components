use super::CreateOnboardingConfigurationRequest;
use newtypes::ObConfigurationId;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreatePlaybookVersionRequest {
    pub expected_latest_obc_id: ObConfigurationId,
    pub new_onboarding_config: CreateOnboardingConfigurationRequest,
    // TODO: Later, we can add in the ability to modify rules in the same transaction to resolve
    // incompatibilities between the updated onboarding configuration and the existing rules.
}

use super::CreateOnboardingConfigurationRequest;
use newtypes::ObConfigurationId;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreatePlaybookVersionRequest {
    /// The latest OBC ID in the timeline for this playbook. Provided to ensure the client has an
    /// up-to-date view of the playbook timeline.
    pub expected_latest_obc_id: ObConfigurationId,
    /// The new playbook version to be created.
    pub new_onboarding_config: CreateOnboardingConfigurationRequest,
    // TODO: Later, we can add in the ability to modify rules in the same transaction to resolve
    // incompatibilities between the updated onboarding configuration and the existing rules.
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct RestoreOnboardingConfigurationRequest {
    /// The latest OBC ID in the timeline for this playbook. Provided to ensure the client has an
    /// up-to-date view of the playbook timeline.
    pub expected_latest_obc_id: ObConfigurationId,
    /// The OBC ID that should be restored.
    pub restore_obc_id: ObConfigurationId,
}

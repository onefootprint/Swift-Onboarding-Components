use super::sdk_args::UserDataV1;
use newtypes::BoId;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKey;
use newtypes::TenantId;
use newtypes::WorkflowId;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
/// Short-lived session representing an ob config, instead of using the long-lived publishable keys
pub struct DeprecatedOnboardingSession {
    pub tenant_id: TenantId,
    pub ob_config_id: ObConfigurationId,
    pub is_live: bool,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct OnboardingSession {
    pub key: ObConfigurationKey,
    pub bootstrap_data: UserDataV1,
    #[serde(default)]
    pub trusted_metadata: OnboardingSessionTrustedMetadata,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Default)]
/// Metadata that should not be serialized to the client in the normal `/hosted/onboarding/session`
/// flow. This metadata is generally only read in contexts that accept `ObSessionAuth`
/// where we need guarantees that its value has not been spoofed by the client.
pub struct OnboardingSessionTrustedMetadata {
    pub allow_reonboard: bool,
}

/// A business-owner specific session. This is issued when sending out links to each owner of a
/// business in order to allow each BO to fill out the
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct BoSession {
    pub bo_id: BoId,
    pub ob_config_id: ObConfigurationId,
    // TODO make optional after all tokens expire
    pub biz_wf_id: Option<WorkflowId>,
}

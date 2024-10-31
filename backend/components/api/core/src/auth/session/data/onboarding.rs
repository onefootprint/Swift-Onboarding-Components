use super::sdk_args::UserDataV1;
use newtypes::BoId;
use newtypes::ExternalId;
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
/// Metadata provided when a tenant creates an onboarding session token via secret API key.
/// This metadata is not serialized directly to the client in the normal
/// `/hosted/onboarding/session` flow. Instead, it is stored directly into the created user auth
/// session. As such, its values are guaranteed to not be spoofed by the client and were passed
/// directly from the tenant.
pub struct OnboardingSessionTrustedMetadata {
    pub allow_reonboard: bool,
    pub business_external_id: Option<ExternalId>,
}

/// A business-owner specific session. This is issued when sending out links to each owner of a
/// business in order to allow each BO to fill out the
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct BoSession {
    pub bo_id: BoId,
    pub ob_config_id: ObConfigurationId,
    pub biz_wf_id: WorkflowId,
}

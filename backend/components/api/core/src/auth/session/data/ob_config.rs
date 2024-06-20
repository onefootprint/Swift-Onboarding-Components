use newtypes::BoId;
use newtypes::ObConfigurationId;
use newtypes::TenantId;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
/// Short-lived session representing an ob config, instead of using the long-lived publishable keys
pub struct OnboardingSession {
    pub tenant_id: TenantId,
    pub ob_config_id: ObConfigurationId,
    pub is_live: bool,
}

/// A business-owner specific session. This is issued when sending out links to each owner of a
/// business in order to allow each BO to fill out the
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct BoSession {
    pub bo_id: BoId,
    pub ob_config_id: ObConfigurationId,
}

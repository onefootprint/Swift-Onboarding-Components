use super::onboarding::OnboardingSessionTrustedMetadata;
use newtypes::AuthEventId;
use newtypes::BoId;
use newtypes::DataIdentifier;
use newtypes::IdentifyScope;
use newtypes::ObConfigurationId;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::WorkflowId;

/// An auth session for an in-progress identify flow
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
// WARNING: changing this could break existing user auth sessions
pub struct IdentifySession {
    /// The vault_id of the temporary user vault created to store data vaulted during the identify
    /// flow. This vault_id will be thrown away if we locate an existing vault with matching data.
    pub placeholder_uv_id: VaultId,
    /// The vault_id of the temporary scoped vault created to store data vaulted during the identify
    /// flow. This vault_id will be thrown away if we locate an existing vault with matching data.
    pub placeholder_su_id: ScopedVaultId,
    pub scope: IdentifyScope,
    pub auth_event_ids: Vec<AuthEventId>,

    pub obc_id: ObConfigurationId,
    pub metadata: Option<OnboardingSessionTrustedMetadata>,

    /// Info on the business for secondary BO flows.
    pub business_info: Option<BusinessInfo>,

    pub kba: Vec<DataIdentifier>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct BusinessInfo {
    pub bo_id: BoId,
    pub bv_id: VaultId,
    pub biz_wf_id: WorkflowId,
}

impl IdentifySession {
    pub fn add_auth_event(mut self, id: AuthEventId) -> Self {
        self.auth_event_ids.push(id);
        self
    }
}

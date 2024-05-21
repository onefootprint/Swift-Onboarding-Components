use crate::*;
use newtypes::{TenantId, WorkosAuthMethod};

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct PrivateTenantFilters {
    pub search: Option<String>,
    pub is_live: Option<bool>,
    pub only_with_domains: Option<bool>,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct PrivateTenant {
    pub id: TenantId,
    pub name: String,
    pub domains: Vec<String>,
    pub allow_domain_access: bool,
    pub is_live: bool,
    pub is_prod_kyc_playbook_restricted: bool,
    pub is_prod_kyb_playbook_restricted: bool,
    pub supported_auth_methods: Option<Vec<WorkosAuthMethod>>,
    pub num_live_vaults: i64,
    pub num_sandbox_vaults: i64,
    pub created_at: DateTime<Utc>,
    pub super_tenant_id: Option<TenantId>,
}

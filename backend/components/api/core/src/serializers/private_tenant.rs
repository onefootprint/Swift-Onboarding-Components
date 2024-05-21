use db::models::tenant::{Tenant, UserCounts};

use crate::utils::db2api::DbToApi;

impl DbToApi<(Option<UserCounts>, Tenant)> for api_wire_types::PrivateTenant {
    fn from_db((counts, t): (Option<UserCounts>, Tenant)) -> Self {
        let Tenant {
            id,
            name,
            domains,
            allow_domain_access,
            sandbox_restricted,
            is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
            supported_auth_methods,
            _created_at,
            super_tenant_id,
            ..
        } = t;
        Self {
            id,
            name,
            domains,
            allow_domain_access,
            is_live: !sandbox_restricted,
            is_prod_kyc_playbook_restricted: is_prod_ob_config_restricted,
            is_prod_kyb_playbook_restricted,
            supported_auth_methods,
            num_live_vaults: counts.as_ref().map(|c| c.live).unwrap_or_default(),
            num_sandbox_vaults: counts.as_ref().map(|c| c.sandbox).unwrap_or_default(),
            created_at: _created_at,
            super_tenant_id,
        }
    }
}

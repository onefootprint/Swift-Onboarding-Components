use chrono::Utc;
use newtypes::{SealedVaultBytes, TenantId, TenantVendorControlId};

use crate::models::tenant_vendor::TenantVendorControl;

pub fn create_in_memory(
    tenant_id: TenantId,
    idology_enabled: bool,
    idology_username: Option<String>,
    idology_e_password: Option<SealedVaultBytes>,
    experian_enabled: bool,
    experian_subscriber_code: Option<String>,
) -> TenantVendorControl {
    TenantVendorControl {
        id: TenantVendorControlId::from("tvc_1".to_string()),
        tenant_id,
        deactivated_at: None,
        _created_at: Utc::now(),
        _updated_at: Utc::now(),
        idology_enabled,
        idology_username,
        idology_e_password,
        experian_enabled,
        experian_subscriber_code,
    }
}

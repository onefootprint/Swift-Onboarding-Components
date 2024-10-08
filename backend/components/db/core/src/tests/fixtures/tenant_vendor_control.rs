use crate::models::tenant_vendor::TenantVendorControl;
use chrono::Utc;
use newtypes::TenantId;
use newtypes::TenantVendorControlId;

pub fn create_in_memory(
    tenant_id: TenantId,
    idology_enabled: bool,
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
        experian_enabled,
        experian_subscriber_code,
        middesk_api_key: None,
        lexis_enabled: false,
        sentilink_credentials: None,
    }
}

/// Vault Disaster Recovery API resources
use crate::Apiv2Schema;
use newtypes::TenantId;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct VaultDrStatus {
    pub org_id: TenantId,
    pub org_name: String,
    pub is_live: bool,
    // TODO:
    // - Enrollment status
    // - Latest backup record timestamp
    // - Latest online record timestamp
    // - Lag time
    // - Lag record count
}

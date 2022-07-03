use crate::schema::audit_trails;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use diesel_as_jsonb::AsJsonb;
use newtypes::{AuditTrailId, DataKind, TenantId, UserVaultId, Vendor};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "audit_trails"]
pub struct AuditTrail {
    pub id: AuditTrailId,
    pub user_vault_id: UserVaultId,
    // Optional tenant_id if the event should only be visible by a specific tenant
    pub tenant_id: Option<TenantId>,
    pub event: AuditTrailEvent,
    pub timestamp: NaiveDateTime,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb)]
#[serde(rename_all = "snake_case")]
pub enum AuditTrailEvent {
    LivenessCheck(LivenessCheckInfo),
    Verification(VerificationInfo),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LivenessCheckInfo {
    pub attestations: Vec<String>,
    pub device: String,
    pub ip_address: String,
    pub location: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationInfo {
    pub data_kinds: Vec<DataKind>,
    pub vendor: Vendor,
}

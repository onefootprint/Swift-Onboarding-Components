use crate::{schema::audit_trails, DbError};
use chrono::NaiveDateTime;
use diesel::{Insertable, PgConnection, Queryable, RunQueryDsl};
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

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "audit_trails"]
struct NewAuditTrail {
    pub user_vault_id: UserVaultId,
    pub tenant_id: Option<TenantId>,
    pub event: AuditTrailEvent,
    pub timestamp: NaiveDateTime,
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
    pub ip_address: Option<String>,
    pub location: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationInfo {
    pub data_kinds: Vec<DataKind>,
    pub vendor: Vendor,
}

impl AuditTrailEvent {
    pub fn save(
        self,
        conn: &PgConnection,
        user_vault_id: UserVaultId,
        tenant_id: Option<TenantId>,
    ) -> Result<(), DbError> {
        let row = NewAuditTrail {
            user_vault_id,
            tenant_id,
            timestamp: chrono::Utc::now().naive_utc(),
            event: self,
        };
        diesel::insert_into(audit_trails::table)
            .values(row)
            .execute(conn)?;
        Ok(())
    }
}

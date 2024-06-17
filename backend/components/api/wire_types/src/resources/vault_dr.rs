/// Vault Disaster Recovery API resources
use crate::Apiv2Schema;
use chrono::{
    DateTime,
    Utc,
};
use newtypes::TenantId;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct VaultDrStatus {
    pub org_id: TenantId,
    pub org_name: String,
    pub is_live: bool,

    pub enrolled_status: Option<VaultDrEnrolledStatus>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct VaultDrEnrolledStatus {
    pub enrolled_at: DateTime<Utc>,

    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    // We expose the org public key so clients can verify their own private key.
    pub org_public_key: String,
    // TODO:
    // - Latest backup record timestamp
    // - Latest online record timestamp
    // - Lag time
    // - Lag record count
}

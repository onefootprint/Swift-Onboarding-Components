/// Vault Disaster Recovery API resources
use crate::Apiv2Response;
use chrono::DateTime;
use chrono::Utc;
use newtypes::TenantId;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct VaultDrStatus {
    pub org_id: TenantId,
    pub org_name: String,
    pub is_live: bool,

    pub enrolled_status: Option<VaultDrEnrolledStatus>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct VaultDrEnrolledStatus {
    pub enrolled_at: DateTime<Utc>,

    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    // We expose the org public keys so clients can verify their own private key.
    pub org_public_keys: Vec<String>,

    pub latest_backup_record_timestamp: Option<DateTime<Utc>>,
    pub latest_online_record_timestamp: Option<DateTime<Utc>>,
}

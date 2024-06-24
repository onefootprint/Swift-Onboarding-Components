use chrono::DateTime;
use chrono::Utc;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

#[derive(Debug, Clone, Deserialize)]
pub struct VaultDrStatus {
    pub org_id: String,
    pub org_name: String,
    pub is_live: bool,

    pub enrolled_status: Option<VaultDrEnrolledStatus>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct VaultDrEnrolledStatus {
    pub enrolled_at: DateTime<Utc>,

    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    pub org_public_key: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct VaultDrAwsPreEnrollResponse {
    pub external_id: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct VaultDrEnrollRequest {
    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    pub org_public_key: String,

    pub re_enroll: Option<bool>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct VaultDrEnrollResponse {}

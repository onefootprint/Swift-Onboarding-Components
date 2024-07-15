use chrono::DateTime;
use chrono::Utc;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;
use std::fmt::Display;

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

    pub org_public_keys: Vec<String>,

    pub latest_backup_record_timestamp: Option<DateTime<Utc>>,
    pub latest_online_record_timestamp: Option<DateTime<Utc>>,
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

    pub org_public_keys: Vec<String>,

    pub re_enroll: Option<bool>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct VaultDrEnrollResponse {}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ApiError {
    pub message: String,
    pub code: Option<String>,
    pub support_id: String,
}

impl Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let ser = serde_json::to_string(&self).unwrap();
        write!(f, "{}", ser)
    }
}

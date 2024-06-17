use chrono::{
    DateTime,
    Utc,
};
use core::fmt;
use serde::{
    Deserialize,
    Serialize,
};
use std::fmt::{
    Debug,
    Display,
    Formatter,
};

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
}

#[derive(Clone, Deserialize)]
pub(crate) struct OrgPrivateKey(String);

impl OrgPrivateKey {
    pub(crate) fn leak_ref(&self) -> &str {
        &self.0
    }
}

impl Display for OrgPrivateKey {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "<redacted Org Private Key>")
    }
}

impl Debug for OrgPrivateKey {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "<redacted Org Private Key>")
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct VaultDrEnrollResponse {
    pub org_private_key: OrgPrivateKey,
}

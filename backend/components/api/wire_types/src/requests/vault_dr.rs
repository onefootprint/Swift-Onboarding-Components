use newtypes::PiiString;
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct VaultDrAwsPreEnrollResponse {
    pub external_id: PiiString,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct VaultDrEnrollRequest {
    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    pub re_enroll: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct VaultDrEnrollResponse {
    pub org_private_key: PiiString,
}

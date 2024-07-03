use newtypes::PiiString;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct VaultDrAwsPreEnrollResponse {
    pub external_id: PiiString,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct VaultDrEnrollRequest {
    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    pub org_public_keys: Vec<String>,

    pub re_enroll: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct VaultDrEnrollResponse {
    // Using a dedicated struct instead of Empty so types align directly with the Rust client.
}


#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct VaultDrRevealWrappedRecordKeysRequest {
    pub record_paths: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct VaultDrRevealWrappedRecordKeysResponse {
    /// Maps record paths to their wrapped record keys.
    pub wrapped_record_keys: HashMap<String, PiiString>,
}

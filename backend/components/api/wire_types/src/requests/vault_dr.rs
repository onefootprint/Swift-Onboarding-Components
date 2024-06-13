use newtypes::PiiString;
use paperclip::actix::Apiv2Schema;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct VaultDrAwsPreEnrollResponse {
    pub external_id: PiiString,
}

use diesel_derive_enum::DbEnum;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

#[derive(Debug, DbEnum, PartialEq, Clone, Copy, Deserialize, Serialize, Apiv2Schema)]
#[serde(rename_all = "lowercase")]
#[PgType = "attestation_type"]
#[DieselType = "Attestation_type"]
#[DbValueStyle = "verbatim"]
pub enum AttestationType {
    None,
    Unknown,
    Apple,
    AppleApp,
    AndroidKey,
    AndroidSafetyNet,
}

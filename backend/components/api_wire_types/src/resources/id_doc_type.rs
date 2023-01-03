use crate::{export_schema, Apiv2Schema, Deserialize, JsonSchema, Serialize};
// This matches idology scan verify documentation as of 2022-12-22
// https://web.idologylive.com/api_portal.php#step-3-obtaining-scan-verify-results-subtitle-step-3-scan-verify
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, Apiv2Schema)]
#[serde(serialize = "camelCase")]
pub enum IdDocType {
    IdCard,
    DriverLicense,
    Passport,
}

export_schema!(IdDocType);

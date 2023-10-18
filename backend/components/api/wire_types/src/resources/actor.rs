use crate::*;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum Actor {
    Footprint,
    FirmEmployee,
    Organization { member: String },
    ApiKey { id: TenantApiKeyId, name: String },
}

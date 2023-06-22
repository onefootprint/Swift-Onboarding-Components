use crate::*;

#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum Actor {
    Footprint,
    FirmEmployee,
    Organization { member: String },
    ApiKey { name: String },
}

export_schema!(Actor);

use crate::{export_schema, Apiv2Schema, Deserialize, JsonSchema, Serialize};
use newtypes::FpId;

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, Apiv2Schema)]
pub struct BusinessOwner {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<FpId>,
    pub ownership_stake: u32,
}

export_schema!(BusinessOwner);

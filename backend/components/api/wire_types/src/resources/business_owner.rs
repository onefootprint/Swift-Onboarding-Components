use crate::{export_schema, Apiv2Schema, JsonSchema, Serialize};
use newtypes::{BusinessOwnerKind, FpId, OnboardingStatus};

#[derive(Debug, Clone, Serialize, JsonSchema, Apiv2Schema)]
pub struct BusinessOwner {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<FpId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<OnboardingStatus>,
    pub ownership_stake: Option<u32>,
    pub kind: BusinessOwnerKind,
}

export_schema!(BusinessOwner);

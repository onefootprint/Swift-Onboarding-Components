use crate::*;

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum Actor {
    Footprint,
    Organization { member: OrgMemberEmail },
}

export_schema!(OnboardingDecision);
export_schema!(Actor);

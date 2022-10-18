use crate::*;

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct Requirement {
    pub id: RequirementId,
    pub onboarding_id: OnboardingId,
    pub kind: RequirementKind,
    pub initiator: RequirementInitiator,
    pub status: RequirementVerificationStatus,
    pub vendors: Vec<Vendor>,
    pub risk_signal_ids: Vec<RiskSignalId>,
    pub fulfilled_at: DateTime<Utc>,
}

export_schema!(Requirement);

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
pub enum RequirementVerificationStatus {
    Failed,
    Verified,
}

export_schema!(RequirementVerificationStatus);

use crate::*;

/// Describes a liveness event that took place
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OnboardingDecision {
    pub id: OnboardingDecisionId,
    pub verification_status: VerificationStatus,
    pub compliance_status: ComplianceStatus,
    pub timestamp: DateTime<Utc>,
    pub source: DecisionSource,
}

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum DecisionSource {
    Footprint,
    Organization { member: OrgMemberEmail },
}

export_schema!(OnboardingDecision);
export_schema!(DecisionSource);

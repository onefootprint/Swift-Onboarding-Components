use crate::*;

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
pub struct Decision {
    pub id: DecisionId,
    pub verification_status: VerificationStatus,
    pub compliance_status: ComplianceStatus,
    pub source: DecisionSource,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum DecisionSource {
    Footprint,
    Organization { member: OrgMemberEmail },
}

export_schema!(Decision);
export_schema!(DecisionSource);

use crate::*;

/// Describes the outcome of an onboarding decision that took place on the user
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct OnboardingDecision {
    pub id: OnboardingDecisionId,
    pub verification_status: VerificationStatus,
    pub compliance_status: ComplianceStatus,
    pub timestamp: DateTime<Utc>,
    pub source: DecisionSource,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ob_configuration: Option<LiteObConfiguration>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vendors: Option<Vec<Vendor>>,
}

/// ObConfiguration serialization used inside of an OnboardingDecision
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct LiteObConfiguration {
    pub must_collect_data: Vec<CollectedDataOption>,
    pub must_collect_identity_document: bool,
}

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum DecisionSource {
    // TODO vendors for FootprintDecision
    Footprint,
    Organization { member: OrgMemberEmail },
}

export_schema!(OnboardingDecision);
export_schema!(DecisionSource);

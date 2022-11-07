use crate::*;

/// A risk event
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub onboarding_decision_id: OnboardingDecisionId,
    pub reason_code: FootprintReasonCode,
    pub description: String,
    pub severity: SignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
    pub deactivated_at: Option<chrono::DateTime<Utc>>,
    pub vendors: Vec<Vendor>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw_responses: Option<Vec<RiskSignalRawResponse>>,
}

export_schema!(RiskSignal);

#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct RiskSignalRawResponse {
    pub vendor: Vendor,
    pub response: serde_json::Value,
}

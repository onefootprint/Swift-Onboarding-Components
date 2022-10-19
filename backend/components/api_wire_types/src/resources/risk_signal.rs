use crate::*;

/// A risk event
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub onboarding_decision_id: OnboardingDecisionId,
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub severity: SignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
    pub deactivated_at: Option<chrono::DateTime<Utc>>,
}
export_schema!(RiskSignal);

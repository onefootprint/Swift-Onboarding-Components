use crate::*;

/// RiskSignal information, including severity, impacted scopes, and more.
#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
pub struct RiskSignal {
    // TODO: rename PublicRiskSignal ? might be a nice pattern to start adopting for stuff thats public facing?
    pub id: RiskSignalId,
    pub onboarding_decision_id: Option<OnboardingDecisionId>, // TODO: remove this ??
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
}

export_schema!(RiskSignal);

/// Non-public RiskSignal serialization that has additional information (at the moment just AML stuff about specific hits)
#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
pub struct RiskSignalDetail {
    pub id: RiskSignalId,
    pub onboarding_decision_id: Option<OnboardingDecisionId>,
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
    pub aml: Option<AmlDetail>,
}

export_schema!(RiskSignalDetail);

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
pub struct PublicRiskSignalDescription {
    pub reason_code: FootprintReasonCode,
    /// Short description of the reason code
    pub note: String,
    /// Description of the reason code
    pub description: String,
    /// An indication of importance
    pub severity: SignalSeverity,
    /// What the reason code applies to (Name, Document, Business, etc)
    pub scopes: Vec<SignalScope>,
}

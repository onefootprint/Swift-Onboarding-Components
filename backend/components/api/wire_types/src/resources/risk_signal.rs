use crate::*;
use newtypes::{
    FootprintReasonCode,
    OnboardingDecisionId,
    RiskSignalId,
    SignalScope,
    SignalSeverity,
};

/// RiskSignal information, including severity, impacted scopes, and more.
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub onboarding_decision_id: Option<OnboardingDecisionId>, // TODO: remove this ??
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
}

/// RiskSignal information, including severity, impacted scopes, and more.
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PublicRiskSignal {
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
}

/// Non-public RiskSignal serialization that has additional information (at the moment just AML
/// stuff about specific hits)
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct RiskSignalDetail {
    pub id: RiskSignalId,
    pub onboarding_decision_id: Option<OnboardingDecisionId>,
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
    pub has_aml_hits: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
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

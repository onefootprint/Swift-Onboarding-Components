use crate::*;
use newtypes::FootprintReasonCode;
use newtypes::OnboardingDecisionId;
use newtypes::RiskSignalId;
use newtypes::SignalScope;
use newtypes::SignalSeverity;

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

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PublicRiskSignal {
    #[openapi(example = "address_does_not_match")]
    pub reason_code: FootprintReasonCode,
    #[openapi(example = "Address does not match")]
    pub note: String,
    #[openapi(example = "Address located does not match address input.")]
    pub description: String,
    #[openapi(example = "high")]
    pub severity: SignalSeverity,
    #[openapi(example = r#"["address"]"#)]
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
}

/// Non-public RiskSignal serialization that has additional information
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
    pub has_sentilink_detail: bool,
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

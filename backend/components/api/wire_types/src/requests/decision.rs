use crate::*;
use newtypes::{
    DecisionStatus,
    OnboardingStatus,
};

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct DecisionRequest {
    pub annotation: CreateAnnotationRequest,
    pub status: TerminalDecisionStatus,
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateUserDecisionRequest {
    /// Human-readable explanation for the manual review that will be displayed in the user timeline
    /// on the dashboard.
    pub annotation: String,
    pub status: TerminalDecisionStatus,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum TerminalDecisionStatus {
    Fail,
    Pass,
}

// TODO when DecisionStatus no longer contains ManualReview, get rid of this
impl From<TerminalDecisionStatus> for DecisionStatus {
    fn from(s: TerminalDecisionStatus) -> Self {
        match s {
            TerminalDecisionStatus::Pass => Self::Pass,
            TerminalDecisionStatus::Fail => Self::Fail,
        }
    }
}

impl From<TerminalDecisionStatus> for OnboardingStatus {
    fn from(value: TerminalDecisionStatus) -> Self {
        match value {
            TerminalDecisionStatus::Pass => Self::Pass,
            TerminalDecisionStatus::Fail => Self::Fail,
        }
    }
}

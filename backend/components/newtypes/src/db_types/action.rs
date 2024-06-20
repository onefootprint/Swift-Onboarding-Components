use crate::DecisionStatus;
use crate::WorkflowRequestConfig;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;

#[derive(Debug, Clone, Copy, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum TerminalDecisionStatus {
    Fail,
    Pass,
}

impl From<TerminalDecisionStatus> for DecisionStatus {
    fn from(s: TerminalDecisionStatus) -> Self {
        match s {
            TerminalDecisionStatus::Pass => Self::Pass,
            TerminalDecisionStatus::Fail => Self::Fail,
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateAnnotationRequest {
    pub note: String,
    pub is_pinned: bool,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct ManualDecisionRequest {
    pub annotation: CreateAnnotationRequest,
    pub status: TerminalDecisionStatus,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct TriggerRequest {
    pub trigger: WorkflowRequestConfig,
    /// Optional note with more context on what we're asking the user to do
    pub note: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum EntityAction {
    Trigger(TriggerRequest),
    ClearReview,
    ManualDecision(ManualDecisionRequest),
}

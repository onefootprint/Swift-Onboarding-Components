use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct DecisionRequest {
    pub annotation: CreateAnnotationRequest,
    pub status: TerminalDecisionStatus,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Deserialize, Apiv2Schema, JsonSchema)]
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

export_schema!(DecisionRequest);

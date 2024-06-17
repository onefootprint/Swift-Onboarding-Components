use crate::*;
use newtypes::TerminalDecisionStatus;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateUserDecisionRequest {
    /// Human-readable explanation for the manual review that will be displayed in the user timeline
    /// on the dashboard.
    pub annotation: String,
    pub status: TerminalDecisionStatus,
}

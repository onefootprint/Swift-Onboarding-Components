use newtypes::{DecisionStatus, RuleAction};
use serde::Serialize;

#[derive(PartialEq, Eq, Debug, Clone, Serialize)]
pub struct Decision {
    pub decision_status: DecisionStatus,
    pub should_commit: bool,
    pub create_manual_review: bool,
    pub action: Option<RuleAction>,
}

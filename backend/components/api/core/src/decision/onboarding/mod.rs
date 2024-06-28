use newtypes::RuleAction;
use serde::Serialize;

#[derive(PartialEq, Eq, Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
/// The outcome of running the rules engine
pub enum RulesOutcome {
    RulesExecuted {
        should_commit: bool,
        create_manual_review: bool,
        action: Option<RuleAction>,
    },
    RulesNotExecuted,
}
impl RulesOutcome {
    pub fn should_commit(&self) -> bool {
        match self {
            Self::RulesExecuted { should_commit, .. } => *should_commit,
            Self::RulesNotExecuted => false,
        }
    }

    pub fn create_manual_review(&self) -> bool {
        match self {
            Self::RulesExecuted {
                create_manual_review, ..
            } => *create_manual_review,
            Self::RulesNotExecuted => false,
        }
    }
}

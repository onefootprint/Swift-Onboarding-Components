use crate::DecisionStatus;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    Debug,
    Clone,
    Display,
    Copy,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    PartialEq,
    Eq,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum WorkflowFixtureResult {
    Fail,
    Pass,
    ManualReview,
    StepUp,
    // TODO combine these two - they are identical, with the latter being better named
    DocumentDecision,
    UseRulesOutcome,
}

impl WorkflowFixtureResult {
    /// For a given WorkflowFixtureResult, returns the desired DecisionStatus and whether we should
    /// raise a manual review
    pub fn decision_status(&self) -> (DecisionStatus, bool) {
        match self {
            WorkflowFixtureResult::Pass => (DecisionStatus::Pass, false),
            WorkflowFixtureResult::Fail => (DecisionStatus::Fail, false),
            WorkflowFixtureResult::ManualReview => (DecisionStatus::Fail, true),
            WorkflowFixtureResult::StepUp => (DecisionStatus::StepUp, false),
            // This isn't quite right, and will be ignored. We are running real rules on a real sandbox
            // document vendor call but this fn is used in a lot of places and we should have it
            // return something
            WorkflowFixtureResult::DocumentDecision | WorkflowFixtureResult::UseRulesOutcome => {
                (DecisionStatus::Pass, false)
            }
        }
    }
}

crate::util::impl_enum_str_diesel!(WorkflowFixtureResult);

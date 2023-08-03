pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use strum_macros::{AsRefStr, EnumString};

use crate::SandboxId;

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
    JsonSchema,
    Eq,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum WorkflowFixtureResult {
    Fail,
    Pass,
    ManualReview,
    StepUp,
}
crate::util::impl_enum_str_diesel!(WorkflowFixtureResult);

impl WorkflowFixtureResult {
    pub fn from_sandbox_id(value: Option<&SandboxId>) -> Option<Self> {
        let value = value?.to_lowercase();
        let res = if value.starts_with("fail") {
            Self::Fail
        } else if value.starts_with("manualreview") {
            Self::ManualReview
        } else if value.starts_with("stepup") {
            Self::StepUp
        } else {
            Self::Pass
        };
        Some(res)
    }
}

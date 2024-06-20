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
    DocumentDecision,
}

crate::util::impl_enum_str_diesel!(WorkflowFixtureResult);

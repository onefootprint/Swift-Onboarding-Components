use derive_more::Display;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Apiv2Schema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DecisionStatus {
    Fail,
    Pass,
    None,
}

crate::util::impl_enum_str_diesel!(DecisionStatus);

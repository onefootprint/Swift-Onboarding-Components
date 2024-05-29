use crate::util::impl_enum_str_diesel;
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum::AsRefStr;
use strum_macros::{
    Display,
    EnumString,
};

#[derive(
    Display,
    SerializeDisplay,
    DeserializeFromStr,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Hash,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum RiskSignalGroupKind {
    Kyc,
    Kyb,
    Doc,
    WebDevice,
    NativeDevice,
    Aml,
    Behavior,
}

impl_enum_str_diesel!(RiskSignalGroupKind);

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
use strum_macros::{
    AsRefStr,
    Display,
    EnumString,
};

#[derive(
    Debug,
    Clone,
    Copy,
    Display,
    DeserializeFromStr,
    SerializeDisplay,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum SambaOrderKind {
    LicenseValidation,
    ActivityHistory,
}

impl_enum_str_diesel!(SambaOrderKind);

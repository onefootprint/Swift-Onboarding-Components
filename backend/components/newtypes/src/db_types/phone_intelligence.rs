use crate::util::impl_enum_str_diesel;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use serde::Serialize;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

#[derive(
    Eq,
    PartialEq,
    Debug,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    Hash,
    AsRefStr,
    serde_with::DeserializeFromStr,
    Serialize,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum PhoneLookupAttributes {
    LineTypeIntelligence,
}

impl_enum_str_diesel!(PhoneLookupAttributes);

use derive_more::Display;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

/// The type of data attribute
#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    Hash,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum ContactInfoPriority {
    Primary,
    Secondary,
}
crate::util::impl_enum_str_diesel!(ContactInfoPriority);

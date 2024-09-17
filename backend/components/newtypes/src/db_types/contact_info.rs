use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    // CAREFUL, this is the bad Display implemention. We should migrate away from using this
    derive_more::Display,
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

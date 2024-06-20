use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumIter;
use strum_macros::EnumString;

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    serde_with::SerializeDisplay,
    Hash,
    Clone,
    Copy,
    EnumIter,
    EnumString,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    Default,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum AndroidAppRecognition {
    Recognized,
    Unrecognized,
    Unevaluated,
    #[default]
    Unknown,
}
crate::util::impl_enum_str_diesel!(AndroidAppRecognition);

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    serde_with::SerializeDisplay,
    Hash,
    Clone,
    Copy,
    EnumIter,
    EnumString,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    Default,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum AndroidAppLicense {
    #[default]
    Unknown,
    Unevaluated,
    Unlicensed,
    Licensed,
}
crate::util::impl_enum_str_diesel!(AndroidAppLicense);

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    serde_with::SerializeDisplay,
    Hash,
    Clone,
    Copy,
    EnumIter,
    EnumString,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    Default,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum AndroidDeviceIntegrityLevel {
    #[default]
    Unknown,
    Basic,
    Sufficient,
    Strong,
}
crate::util::impl_enum_str_diesel!(AndroidDeviceIntegrityLevel);

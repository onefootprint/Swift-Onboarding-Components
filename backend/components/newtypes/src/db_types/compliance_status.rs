use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use strum_macros::{
    AsRefStr,
    Display,
    EnumIter,
    EnumString,
};

/// The type of requirement
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
    EnumIter,
    EnumString,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    Default,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum ComplianceStatus {
    // "we screened the user and it came back with no red flags"
    NoFlagsFound,
    // "this check wasn't requested to be performed or it's not functionality built"
    // 2022-10-26 This is the default value until we start screen with ExpectID PA or other vendors
    #[default]
    NotApplicable,
}
crate::util::impl_enum_str_diesel!(ComplianceStatus);

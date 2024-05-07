use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

use strum_macros::{AsRefStr, EnumString};

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
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentFixtureResult {
    /// Document was not verified (random failing reason codes are generated)
    Fail,
    /// Document was verified (e.g. not tampered, all checks passing)
    Pass,
    // TODO: could add other enums for different fail cases
    Real,
}
crate::util::impl_enum_str_diesel!(DocumentFixtureResult);

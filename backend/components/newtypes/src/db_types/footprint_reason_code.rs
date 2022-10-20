use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    EnumIter,
    EnumString,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum FootprintReasonCode {
    // TODO these are just test values
    SubjectDeceased,
    SsnIssuedPriorToDob,
    MobileNumber,
    CorporateEmailDomain,
    SsnDoesNotMatchWithinTolerance,
    LastNameDoesNotMatch,
}
crate::util::impl_enum_str_diesel!(FootprintReasonCode);

use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use strum::AsRefStr;
use strum_macros::Display;
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
pub enum ListKind {
    EmailAddress,
    EmailDomain,
    Ssn9,
    PhoneNumber,
    PhoneCountryCode,
    IpAddress,
}

crate::util::impl_enum_str_diesel!(ListKind);

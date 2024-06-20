use derive_more::Display;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

/// The type of data attribute
#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display, // Careful, this is derive_more::Display, not strum
    Hash,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum AccessEventKind {
    Decrypt,
    Update,
    Delete,
}
crate::util::impl_enum_str_diesel!(AccessEventKind);

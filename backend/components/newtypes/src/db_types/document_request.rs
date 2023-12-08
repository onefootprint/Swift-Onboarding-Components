use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::Display;

use strum_macros::EnumString;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    AsExpression,
    FromSqlRow,
    EnumString,
    SerializeDisplay,
    DeserializeFromStr,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentRequestKind {
    Identity,
    ProofOfSsn,
}

crate::util::impl_enum_string_diesel!(DocumentRequestKind);

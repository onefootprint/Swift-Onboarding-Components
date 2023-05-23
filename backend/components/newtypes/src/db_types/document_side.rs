use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use strum_macros::AsRefStr;

#[derive(
    Debug,
    Eq,
    PartialEq,
    Hash,
    Copy,
    Clone,
    strum_macros::EnumString,
    strum_macros::Display,
    AsRefStr,
    AsExpression,
    FromSqlRow,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DocumentSide {
    Front,
    Back,
    Selfie,
}

crate::util::impl_enum_str_diesel!(DocumentSide);

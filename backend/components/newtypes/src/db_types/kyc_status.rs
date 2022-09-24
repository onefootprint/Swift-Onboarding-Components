pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

/// The type of data attribute
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
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum KycStatus {
    New,
    Pending,
    Failed,
    StepUpRequired,
    Success,
}

crate::util::impl_enum_str_diesel!(KycStatus);

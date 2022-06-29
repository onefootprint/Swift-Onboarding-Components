use super::util::derive_diesel_text_enum;
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use strum_macros::EnumString;

/// Determines what integration the app has.
///
/// Custom indicates that there is no other integration.
#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    PartialEq,
    Eq,
    AsExpression,
    FromSqlRow,
    EnumString,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "PascalCase")]
#[sql_type = "Text"]
pub enum Status {
    Verified,
    Processing,
    Incomplete,
    ManualReview,
    Failed,
}

derive_diesel_text_enum! { Status }

impl Default for Status {
    fn default() -> Self {
        Status::Incomplete
    }
}

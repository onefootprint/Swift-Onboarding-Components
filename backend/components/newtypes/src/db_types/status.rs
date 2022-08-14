pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::util::impl_enum_str_diesel;

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
    AsRefStr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "PascalCase")]
#[diesel(sql_type = Text)]
pub enum Status {
    Verified,
    Processing,
    ManualReview,
    Failed,
}

impl Default for Status {
    fn default() -> Self {
        Status::Processing
    }
}

impl_enum_str_diesel!(Status);

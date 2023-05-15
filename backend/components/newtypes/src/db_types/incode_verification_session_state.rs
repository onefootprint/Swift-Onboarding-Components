pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumIter, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    PartialOrd,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    EnumIter,
    AsRefStr,
    Apiv2Schema,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IncodeVerificationSessionState {
    StartOnboarding,
    AddFront,
    AddBack,
    RetryUpload,
    ProcessId,
    FetchScores,
    Complete,
}

crate::util::impl_enum_str_diesel!(IncodeVerificationSessionState);

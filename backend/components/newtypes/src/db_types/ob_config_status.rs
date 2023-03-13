use crate::util::impl_enum_str_diesel;
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json;
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Eq,
    PartialEq,
    Serialize,
    Deserialize,
    Debug,
    Clone,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "PascalCase")]
#[diesel(sql_type = Text)]
#[derive(Default)]
pub enum ApiKeyStatus {
    #[default]
    Disabled,
    Enabled,
}



impl_enum_str_diesel!(ApiKeyStatus);

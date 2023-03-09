pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::TenantId;

// TODO: can probs rename this to task.rs now

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Apiv2Schema,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

crate::util::impl_enum_str_diesel!(TaskStatus);
#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum TaskData {
    LogMessage(LogMessageTaskArgs),
    LogNumTenantApiKeys(LogNumTenantApiKeysArgs), // proof of concept non-trivial task that does DB stuffs, can remove in future
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogMessageTaskArgs {
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogNumTenantApiKeysArgs {
    pub tenant_id: TenantId,
    pub is_live: bool,
}

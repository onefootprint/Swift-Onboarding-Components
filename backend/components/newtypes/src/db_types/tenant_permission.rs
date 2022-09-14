pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::util::impl_enum_str_diesel;

#[derive(
    Debug,
    Display,
    Clone,
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
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum TenantPermission {
    Admin,
    OnboardingConfiguration,
    ApiKeys,
    OrgSettings,
    SecurityLogs,
    Users,
    Decrypt(String),
}

impl_enum_str_diesel!(TenantPermission);

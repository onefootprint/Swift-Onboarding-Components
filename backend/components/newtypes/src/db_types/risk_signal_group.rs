use crate::util::impl_enum_str_diesel;
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json;
use strum::AsRefStr;
use strum_macros::EnumString;

#[derive(
    Serialize,
    Deserialize,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema,
    Hash,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum RiskSignalGroupKind {
    Kyc,
    Kyb,
    Watchlist,    // TODO: unused and will be rm'd after DB is migrated appropriately
    AdverseMedia, // TODO: unused and will be rm'd after DB is migrated appropriately
    Doc,
    WebDevice,
    NativeDevice,
    Aml, // TODO: This will replace Watchlist + AdverseMedia
}

impl_enum_str_diesel!(RiskSignalGroupKind);

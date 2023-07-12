use crate::util::impl_enum_str_diesel;
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use enum_variant_type::EnumVariantType;
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
    EnumVariantType,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
#[evt(module = "risk_signal_group_struct")]
#[evt(derive(Clone, Hash, PartialEq, Eq))]
pub enum RiskSignalGroupKind {
    Kyc,
    Kyb,
    Watchlist,
    AdverseMedia,
    Doc,
}

impl_enum_str_diesel!(RiskSignalGroupKind);

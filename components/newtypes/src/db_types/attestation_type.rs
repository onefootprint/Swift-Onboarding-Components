use super::util::derive_diesel_text_enum;
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use strum_macros::EnumString;

#[derive(
    Debug,
    Display,
    PartialEq,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
)]
#[serde(rename_all = "lowercase")]
#[strum(serialize_all = "PascalCase")]
#[sql_type = "Text"]
pub enum AttestationType {
    None,
    Unknown,
    Apple,
    AppleApp,
    AndroidKey,
    AndroidSafetyNet,
}

derive_diesel_text_enum! { AttestationType }

use crate::util::impl_enum_str_diesel;
use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;

use serde_json;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    // NOTE: THIS IS THE EVIL Display IMPLEMENTATION
    // It will be camel case :( need to migrate some old uses
    Display,
    Hash,
    Clone,
    Copy,
    SerializeDisplay,
    DeserializeFromStr,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum AuthEventKind {
    Sms,
    Email,
    Passkey,
}

impl_enum_str_diesel!(AuthEventKind);

#[derive(
    Debug,
    strum_macros::Display,
    Clone,
    Copy,
    SerializeDisplay,
    DeserializeFromStr,
    Apiv2Schema,
    EnumString,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ModernAuthEventKind {
    Sms,
    Email,
    Passkey,
}

impl From<AuthEventKind> for ModernAuthEventKind {
    fn from(value: AuthEventKind) -> Self {
        match value {
            AuthEventKind::Email => Self::Email,
            AuthEventKind::Passkey => Self::Passkey,
            AuthEventKind::Sms => Self::Sms,
        }
    }
}

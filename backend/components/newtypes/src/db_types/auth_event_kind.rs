use crate::util::impl_enum_str_diesel;
use crate::ContactInfoKind;
use derive_more::Display;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde_json;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

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
    /// A third party tenant testification that the user authenticated with them.
    ThirdParty,
}

impl_enum_str_diesel!(AuthEventKind);

impl From<ContactInfoKind> for AuthEventKind {
    fn from(value: ContactInfoKind) -> Self {
        match value {
            ContactInfoKind::Email => Self::Email,
            ContactInfoKind::Phone => Self::Sms,
        }
    }
}

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
    #[openapi(skip)]
    ThirdParty,
}

impl From<AuthEventKind> for ModernAuthEventKind {
    fn from(value: AuthEventKind) -> Self {
        match value {
            AuthEventKind::Email => Self::Email,
            AuthEventKind::Passkey => Self::Passkey,
            AuthEventKind::Sms => Self::Sms,
            AuthEventKind::ThirdParty => Self::ThirdParty,
        }
    }
}
